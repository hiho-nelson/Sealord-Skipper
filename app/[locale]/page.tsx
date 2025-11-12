import { redirect } from 'next/navigation';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 重定向到 skipper 页面
  redirect(`/${locale}/skipper`);
}

