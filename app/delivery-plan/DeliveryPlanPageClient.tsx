'use client';

import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import DeliveryPlanWizard from '@/app/components/features/delivery-plan/DeliveryPlanWizard';
import UnifiedPageHeader from '@/app/components/ui/UnifiedPageHeader';

export default function DeliveryPlanPageClient() {
  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        <UnifiedPageHeader
          title="納品プラン作成"
          subtitle="商品の納品プランを作成し、バーコードラベルを発行します"
          userType="seller"
          iconType="delivery"
        />
        <DeliveryPlanWizard />
      </div>
    </DashboardLayout>
  );
} 