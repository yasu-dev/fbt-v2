import { Metadata } from 'next';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import InspectionForm from '@/app/components/features/inspection/InspectionForm';
import PhotographyOnlyForm from '@/app/components/features/inspection/PhotographyOnlyForm';

export const metadata: Metadata = {
  title: '商品検品 - THE WORLD DOOR',
  description: '商品検品',
};

interface PageProps {
  params: {
    productId: string;
  };
  searchParams: {
    mode?: 'photography';
    step?: string;
  };
}

export default function InspectionPage({ params, searchParams }: PageProps) {
  const isPhotographyMode = searchParams?.mode === 'photography';

  return (
    <DashboardLayout userType="staff">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          {/* タブレット最適化：大きめのタイトル */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isPhotographyMode ? '商品撮影' : '商品検品'}
            </h1>
            <p className="text-gray-600 mt-2">
              商品ID: {params.productId}
            </p>
            {isPhotographyMode && (
              <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-block">
                撮影専用モード
              </div>
            )}
          </div>

          {/* 検品フォームまたは撮影モード */}
          {isPhotographyMode ? (
            <PhotographyOnlyForm productId={params.productId} />
          ) : (
            <InspectionForm productId={params.productId} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 