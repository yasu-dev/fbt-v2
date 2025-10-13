'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Zap, TrendingUp } from 'lucide-react'
import { NexusCard, NexusButton } from '@/app/components/ui'

interface QualityResult {
  productId: string
  timestamp: string
  overallScore: number
  qualityGrade: string
  recommendation: {
    action: string
    reason: string
    suggestedPrice?: string
  }
  details: Array<{
    imageIndex: number
    imageName: string
    inspectedItems: Array<{
      name: string
      score: number
      status: string
      confidence: number
    }>
    issues: Array<{
      type: string
      severity: string
      location: { x: number; y: number }
      description: string
    }>
    overallImageScore: number
  }>
  aiConfidence: number
  requiresManualReview: boolean
}

interface AIQualityResultProps {
  result: QualityResult | null
  loading?: boolean
  onAccept?: () => void
  onReject?: () => void
  onRequestManualReview?: () => void
}

export default function AIQualityResult({
  result,
  loading = false,
  onAccept,
  onReject,
  onRequestManualReview
}: AIQualityResultProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (loading) {
    return (
      <NexusCard className="p-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
          <span className="text-gray-600">AI品質判定を実行中...</span>
        </div>
      </NexusCard>
    )
  }

  if (!result) {
    return null
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-nexus-purple bg-nexus-purple/20'
      case 'A': return 'status-badge primary'
      case 'B': return 'status-badge success'
      case 'C': return 'status-badge warning'
      case 'D': return 'status-badge warning'
      default: return 'status-badge error'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'review': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'reject': return <XCircle className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <NexusCard className="p-6">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-nexus-primary" />
            <h3 className="text-lg font-semibold">AI品質判定結果</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>AI信頼度:</span>
            <span className="font-medium">{Math.round(result.aiConfidence * 100)}%</span>
          </div>
        </div>

        {/* 総合評価 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* スコア */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}
            </div>
            <div className="text-sm text-gray-500 mt-1">総合スコア</div>
          </div>

          {/* グレード */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getGradeColor(result.qualityGrade)}`}>
              {result.qualityGrade}
            </div>
            <div className="text-sm text-gray-500 mt-1">品質グレード</div>
          </div>

          {/* 推奨アクション */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              {getActionIcon(result.recommendation.action)}
              <span className="font-medium">
                {result.recommendation.action === 'approve' ? '承認' :
                 result.recommendation.action === 'review' ? '要確認' : '却下'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">推奨アクション</div>
          </div>
        </div>

        {/* 推奨理由 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{result.recommendation.reason}</p>
          {result.recommendation.suggestedPrice && (
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                推奨価格帯: {
                  result.recommendation.suggestedPrice === 'premium' ? 'プレミアム' :
                  result.recommendation.suggestedPrice === 'standard' ? '標準' : '割引'
                }
              </span>
            </div>
          )}
        </div>

        {/* 詳細分析 */}
        <div className="space-y-4">
          <h4 className="font-medium">画像別分析結果</h4>
          
          {/* 画像タブ */}
          <div className="flex gap-2 overflow-x-auto">
            {result.details.map((detail, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedImage === index
                    ? 'bg-nexus-primary text-white'
                    : 'bg-nexus-bg-secondary text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                }`}
              >
                画像 {index + 1}
              </button>
            ))}
          </div>

          {/* 選択された画像の詳細 */}
          {result.details[selectedImage] && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.details[selectedImage].imageName}</span>
                <span className={`font-medium ${getScoreColor(result.details[selectedImage].overallImageScore)}`}>
                  スコア: {Math.round(result.details[selectedImage].overallImageScore)}
                </span>
              </div>

              {/* 検査項目 */}
              <div className="grid grid-cols-1 gap-2">
                {result.details[selectedImage].inspectedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(item.score)}`}>
                        {Math.round(item.score)}
                      </span>
                      {item.status === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 検出された問題 */}
              {result.details[selectedImage].issues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h5 className="font-medium text-yellow-800 mb-2">検出された問題</h5>
                  {result.details[selectedImage].issues.map((issue, idx) => (
                    <div key={idx} className="text-sm text-yellow-700">
                      • {issue.description}（{issue.severity === 'minor' ? '軽微' : '重要'}）
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        {result.requiresManualReview && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">手動確認が推奨されます</span>
            </div>
            <p className="text-sm text-yellow-700">
              AI判定の結果、一部項目で懸念が検出されました。スタッフによる追加確認を推奨します。
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {result.recommendation.action === 'approve' && (
            <NexusButton
              onClick={onAccept}
              variant="primary"
            >
              AI判定を承認
            </NexusButton>
          )}
          
          {result.recommendation.action === 'reject' && (
            <NexusButton
              onClick={onReject}
              variant="danger"
            >
              品質基準不適合
            </NexusButton>
          )}

          <NexusButton
            onClick={onRequestManualReview}
            variant="secondary"
          >
            手動で再確認
          </NexusButton>
        </div>
      </div>
    </NexusCard>
  )
} 