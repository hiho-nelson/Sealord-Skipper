import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// 暂时禁用：用户邮件发送功能已禁用，但保留导入以便将来恢复
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getUserConfirmationEmail } from "@/lib/email-templates/userConfirmation";
import { getAdminNotificationEmail } from "@/lib/email-templates/adminNotification";
import { verifyRecaptcha } from "@/lib/recaptcha/server";
import { withRecaptcha } from "@/lib/recaptcha/schema";

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 基础表单字段模式
const formFields = {
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  email: z.email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
};

// 带 reCAPTCHA 的表单数据验证模式
const dataCaptureSchema = withRecaptcha(formFields);

export async function POST(request: NextRequest) {
  try {
    // 解析并验证请求体
    const body = await request.json();
    const validatedData = dataCaptureSchema.parse(body);

    // 验证 reCAPTCHA token
    const verification = await verifyRecaptcha(validatedData.recaptchaToken);

    if (!verification.success) {
      console.error("reCAPTCHA verification failed:", verification.rawResponse);
      return NextResponse.json(
        {
          error: verification.reason ?? "reCAPTCHA verification failed. Please refresh and try again.",
        },
        { status: 400 }
      );
    }

    // 验证成功后提取表单数据（排除 recaptchaToken）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { recaptchaToken: _, ...formData } = validatedData;

    // 检查是否配置了 Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    // 获取发件人邮箱地址（应来自已验证的域名）
    const fromEmail = "contact@sealordskipper.com";
    // 支持多个管理员邮箱地址（数组格式）
    const adminEmails: string[] = ["thomas@hiho.co.nz","kelly.way@sealord.co.nz"];
    const audienceId = ""; // 可选：特定受众 ID

    // 辅助函数：在请求之间添加延迟（最少 500ms 以遵守 2 次/秒的限制）
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // 辅助函数：处理速率限制并重试
    // 处理 Resend SDK 错误对象 ({ error }) 和抛出的异常
    const handleRateLimit = async <T extends { error?: unknown }>(
      fn: () => Promise<T>,
      retries = 3
    ): Promise<T> => {
      let lastResult: T | null = null;
      let lastError: unknown = null;

      for (let i = 0; i <= retries; i++) {
        try {
          const result = await fn();
          lastResult = result;

          // 检查 Resend SDK 是否返回了错误对象
          if (result.error) {
            const error = result.error as {
              statusCode?: number;
              name?: string;
              message?: string;
            };

            const statusCode = error?.statusCode;

            // 如果是速率限制错误 (429)，使用指数退避重试
            if (statusCode === 429 && i < retries) {
              lastError = error;
              // 指数退避：500ms, 1000ms, 2000ms
              const backoffDelay = Math.pow(2, i) * 500;
              console.warn(
                `Resend rate limit hit (attempt ${i + 1}/${retries + 1}), retrying in ${backoffDelay}ms...`
              );
              await delay(backoffDelay);
              continue;
            }

            // 对于非速率限制错误或最后一次尝试，返回带错误的结果
            return result;
          }

          // 成功 - 结果中没有错误
          return result;
        } catch (error: unknown) {
          lastError = error;

          // 处理抛出的异常（Resend SDK 不应该发生，但以防万一）
          const err = error as { statusCode?: number; status?: number };
          const status = err?.statusCode || err?.status;

          if (status === 429 && i < retries) {
            const backoffDelay = Math.pow(2, i) * 500;
            console.warn(
              `Resend rate limit exception (attempt ${i + 1}/${retries + 1}), retrying in ${backoffDelay}ms...`
            );
            await delay(backoffDelay);
            continue;
          }

          // 如果不是速率限制或最后一次尝试，重新抛出错误
          throw error;
        }
      }

      // 如果重试次数用尽，返回最后的结果或抛出最后的错误
      if (lastResult) {
        return lastResult;
      }
      throw lastError || new Error("Rate limit retries exhausted");
    };

    // 在继续之前检查联系人是否已存在
    // 如果存在，返回错误；如果不存在，创建联系人并发送邮件
    let contactExists = false;
    try {
      const existingContact = await handleRateLimit(() =>
        resend.contacts.get({ email: formData.email })
      );

      // 检查 Resend 响应中的错误
      if (existingContact.error) {
        const error = existingContact.error as { statusCode?: number; message?: string };
        // 如果联系人不存在 (404)，没关系 - 我们会创建它
        if (error.statusCode !== 404) {
          console.error("Error checking contact:", existingContact.error);
          // 如果无法检查，我们仍会继续（失败开放）
        }
      } else if (existingContact.data) {
        // 联系人已存在
        contactExists = true;
      }
    } catch (getError: unknown) {
      // 处理意外异常的备用方案
      console.error("Unexpected error checking contact:", getError);
      // 仍会继续（失败开放）
    }

    // 在下一次 API 调用前添加延迟以遵守速率限制
    await delay(500);

    // 如果联系人已存在，返回错误代码（前端将根据语言环境处理消息）
    if (contactExists) {
      return NextResponse.json(
        {
          code: "ALREADY_REGISTERED",
        },
        { status: 409 } // 冲突状态码
      );
    }

    // 联系人不存在，继续创建联系人并发送邮件
    const contactData: {
      email: string;
      firstName: string;
      lastName: string;
      company?: string;
      country?: string;
      audienceId?: string;
    } = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    // 添加可选字段
    if (formData.company) {
      contactData.company = formData.company;
    }
    if (formData.country) {
      contactData.country = formData.country;
    }

    // 如果已配置，添加到特定受众
    if (audienceId) {
      contactData.audienceId = audienceId;
    }

    // 创建新联系人
    try {
      const createResult = await handleRateLimit(() =>
        resend.contacts.create(contactData)
      );

      // 检查 Resend 响应中的错误
      if (createResult.error) {
        const error = createResult.error as {
          statusCode?: number;
          message?: string;
        };
        // 如果在检查和创建之间创建了联系人（竞态条件），返回错误代码
        if (
          error.statusCode === 409 ||
          error.message?.includes("already exists")
        ) {
          return NextResponse.json(
            {
              code: "ALREADY_REGISTERED",
            },
            { status: 409 }
          );
        }
        // 对于其他错误，记录但继续（我们仍想发送邮件）
        console.error("Failed to create contact:", createResult.error);
      }
    } catch (createError: unknown) {
      // 处理意外异常的备用方案
      const err = createError as { statusCode?: number; message?: string };
      if (err?.statusCode === 409 || err?.message?.includes("already exists")) {
        return NextResponse.json(
          {
            code: "ALREADY_REGISTERED",
          },
          { status: 409 }
        );
      }
      console.error("Failed to create contact (exception):", createError);
    }

    // 在下一次 API 调用前添加延迟以遵守速率限制
    await delay(500);

    // 暂时禁用：向用户发送确认邮件（带速率限制处理）
    // const userEmailResult = await handleRateLimit(() =>
    //   resend.emails.send({
    //     from: fromEmail,
    //     to: formData.email,
    //     subject: "Thank You - Sealord Skipper",
    //     html: getUserConfirmationEmail(formData),
    //   })
    // );

    // 暂时禁用：检查邮件是否成功发送
    // if (userEmailResult.error) {
    //   const error = userEmailResult.error as {
    //     statusCode?: number;
    //     name?: string;
    //     message?: string;
    //   };
    //   console.error("Resend API error sending user email:", userEmailResult.error);
    //   
    //   // 如果重试后仍是速率限制错误，返回更具体的错误
    //   if (error.statusCode === 429) {
    //     return NextResponse.json(
    //       {
    //         error:
    //           "Service temporarily unavailable due to high demand. Please try again in a moment.",
    //       },
    //       { status: 503 } // 服务不可用
    //     );
    //   }
    //   
    //   return NextResponse.json(
    //     { error: "Failed to send confirmation email" },
    //     { status: 500 }
    //   );
    // }

    // 在下一次 API 调用前添加延迟以遵守速率限制
    await delay(500);

    // 向管理员发送通知邮件（可选，仅在配置了管理员邮箱时）
    // 过滤掉与发件人相同的邮箱地址，避免重复发送
    const validAdminEmails = adminEmails.filter(email => email && email !== fromEmail);
    if (validAdminEmails.length > 0) {
      try {
        const adminEmailResult = await handleRateLimit(() =>
          resend.emails.send({
            from: fromEmail,
            to: validAdminEmails, // 支持多个收件人
            subject: `New Data Capture - ${formData.firstName} ${formData.lastName}`,
            html: getAdminNotificationEmail(formData),
          })
        );

        // 检查 Resend 响应中的错误
        if (adminEmailResult.error) {
          // 如果管理员邮件失败，记录但不使请求失败
          console.error(
            "Failed to send admin notification email:",
            adminEmailResult.error
          );
        }
      } catch (adminEmailError) {
        // 如果管理员邮件失败，记录但不使请求失败
        console.error(
          "Failed to send admin notification email (exception):",
          adminEmailError
        );
      }
    }

    return NextResponse.json(
      {
        message: "Data capture successful",
        // id: userEmailResult.data?.id, // 暂时禁用：用户邮件发送已禁用
      },
      { status: 200 }
    );
  } catch (error) {
    // 处理验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.issues },
        { status: 400 }
      );
    }

    // 处理其他错误
    console.error("Data capture API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
