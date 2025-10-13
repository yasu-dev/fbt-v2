'use client';

import { useEffect, useState } from 'react';
import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import { X } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [policyText, setPolicyText] = useState<string>('');

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const res = await fetch('/privacy-policy.txt', { cache: 'no-store' });
        const text = await res.text(); // UTF-8 を前提にそのまま取得
        setPolicyText(text);
      } catch (e) {
        setPolicyText('プライバシーポリシーの読み込みに失敗しました。時間をおいて再度アクセスしてください。');
      }
    };
    loadPolicy();
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-nexus-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <NexusButton
            onClick={handleClose}
            variant="secondary"
            size="sm"
            className="mb-4"
          >
            <X className="w-4 h-4 mr-2" />
            閉じる
          </NexusButton>
          
          <h1 className="text-3xl font-bold text-nexus-text-primary">
            プライバシーポリシー
          </h1>
          <p className="text-nexus-text-secondary mt-2">
            制定日: 2025年10月1日
          </p>
        </div>

        {/* 本文 */}
        <NexusCard className="p-8">
          <div className="prose prose-lg max-w-none space-y-4 prose-headings:text-nexus-text-primary prose-strong:text-nexus-text-primary">
            {(() => {
              const lines = policyText.split(/\r?\n/);
              const elements: JSX.Element[] = [];
              let i = 0;

              const pushParagraph = (buf: string[], key: string) => {
                const text = buf.join(' ').trim();
                if (text) {
                  elements.push(
                    <p key={key} className="text-nexus-text-secondary leading-normal mb-2">
                      {text}
                    </p>
                  );
                }
              };

              const isSeparatorLine = (s: string) => {
                const t = (s || '').trim();
                return t === '________________________________________' || /^-+$/.test(t);
              };

              while (i < lines.length) {
                const raw = lines[i] ?? '';
                const line = raw.trim();

                // スキップ行
                if (!line || isSeparatorLine(line)) {
                  i++;
                  continue;
                }

                // 見出し（第◯条 ...）
                if (/^第\d+条/.test(line)) {
                  elements.push(
                    <h2 key={`h2-${i}`} className="text-xl font-semibold text-nexus-text-primary mb-4">
                      {line}
                    </h2>
                  );
                  i++;
                  continue;
                }

                // 箇条書き（番号付き）
                if (/^\d+\.\s+/.test(line)) {
                  const items: string[] = [];
                  while (i < lines.length && /^\d+\.\s+/.test((lines[i] || '').trim())) {
                    const t = (lines[i] || '').trim().replace(/^\d+\.\s+/, '');
                    items.push(t);
                    i++;
                  }
                  elements.push(
                    <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 text-nexus-text-secondary ml-6">
                      {items.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ol>
                  );
                  continue;
                }

                // 箇条書き（黒点・o 始まりを含む）
                if (/^(•|\-|\*|o)\s+/.test(line)) {
                  const items: string[] = [];
                  while (i < lines.length) {
                    const l = (lines[i] || '').trim();
                    if (!/^(•|\-|\*|o)\s+/.test(l)) break;
                    items.push(l.replace(/^(•|\-|\*|o)\s+/, ''));
                    i++;
                  }
                  elements.push(
                    <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-nexus-text-secondary ml-6">
                      {items.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  );
                  continue;
                }

                // 通常段落（空行までを結合）
                const buf: string[] = [];
                while (i < lines.length) {
                  const cur = lines[i] || '';
                  const t = cur.trim();
                  if (!t) break;
                  if (isSeparatorLine(t)) break;
                  if (/^第\d+条/.test(t) || /^\d+\.\s+/.test(t) || /^(•|\-|\*|o)\s+/.test(t)) break;
                  buf.push(t);
                  i++;
                  // フッター行（制定日）は単独段落にする
                  if (/^制定日[:：]/.test(t)) break;
                }
                pushParagraph(buf, `p-${i}`);
              }

              return elements;
            })()}
          </div>
        </NexusCard>
      </div>
    </div>
  );
}
