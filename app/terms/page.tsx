'use client';

import NexusButton from '@/app/components/ui/NexusButton';
import NexusCard from '@/app/components/ui/NexusCard';
import { X } from 'lucide-react';

export default function TermsPage() {
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
            TWDフルフィラメントシステム利用規約
          </h1>
          <p className="text-nexus-text-secondary mt-2">
            制定日: 2025年10月1日
          </p>
        </div>

        {/* コンテンツ */}
        <NexusCard className="p-8">
          <div className="prose prose-lg max-w-none space-y-8 prose-headings:text-nexus-text-primary prose-strong:text-nexus-text-primary">
            {/* 序文 */}
            <section>
              <p className="text-nexus-text-secondary leading-relaxed">
                本規約は、株式会社THE WORD DOOR（以下「当社」といいます）が提供する倉庫インフラ事業に関するサービス（以下「本サービス」といいます）の利用について定めるものです。
              </p>
            </section>

            {/* 第1条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第1条（用語の定義）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed mb-3">
                本規約において使用する用語は、以下の意味を有するものとします。
              </p>
              <ul className="list-disc list-inside space-y-2 text-nexus-text-secondary">
                <li><strong className="text-nexus-text-primary">「本規約等」</strong>とは、本規約および当社ウェブサイトに記載された注意事項・ガイドラインその他の関連規則の総称をいいます。</li>
                <li><strong className="text-nexus-text-primary">「当社」</strong>とは、株式会社THE WORD DOORをいいます。</li>
                <li><strong className="text-nexus-text-primary">「利用者」</strong>とは、本規約等に同意の上、本サービスを利用する個人または法人をいいます。</li>
                <li><strong className="text-nexus-text-primary">「本サービス」</strong>とは、当社が提供する有償・無償を問わないすべてのサービスを指します。</li>
                <li><strong className="text-nexus-text-primary">「手数料等」</strong>とは、本サービスの利用に伴い発生する各種手数料、実費、および当社が請求するその他の費用の総称をいいます。</li>
              </ul>
            </section>

            {/* 第2条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第2条（利用登録）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>利用者は、当社所定の決済手段を用いた決済手続により登録を行い、登録完了をもって本規約への同意とみなします。</li>
                <li>以下の場合、当社は利用登録を拒否または取消すことができるものとします。
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>利用者と30日以上連絡が取れない場合</li>
                    <li>過去に会員資格を抹消されたことがある場合</li>
                    <li>登録情報に虚偽、誤記、または記入漏れがあった場合</li>
                    <li>支払い義務を履行しなかった場合</li>
                    <li>他者または当社への妨害行為があった場合</li>
                    <li>その他当社が不適当と判断した場合</li>
                  </ul>
                </li>
                <li>利用者は、アカウントを第三者に貸与することはできません。</li>
              </ol>
            </section>

            {/* 第3条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第3条（検品・確認業務に関する制限）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社は以下の業務を原則として行いません。
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>専門知識を要する商材の検品</li>
                    <li>商材（商品）の分解・組立・動作確認</li>
                    <li>記憶媒体の内容確認</li>
                    <li>封印の開封など</li>
                  </ul>
                </li>
                <li>検品結果は、品質、真贋、法令適合性、破損の有無、動作正常性を保証するものではありません。</li>
              </ol>
            </section>

            {/* 第4条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第4条（システムの利用および責任制限）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社は、在庫管理システム、ECサイト連携システム、発送業者とのAPI連携システム等（以下「本システム」といいます）を利用してサービスを提供します。</li>
                <li>本システムは当社がシステム開発会社に委託して構築したものですが、システムの動作、機能、セキュリティ、API連携の安定性等について、当社は一切の保証をいたしません。</li>
                <li>本システムの障害、不具合、API連携の不調、データの消失・破損、セキュリティ侵害等により利用者に生じた損害について、当社は責任を負いません。</li>
                <li>当社は、本システムの改良、API仕様の変更、外部サービスとの連携仕様変更等により、予告なくサービス内容を変更することがあります。</li>
              </ol>
            </section>

            {/* 第5条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第5条（サービス提供の中断・停止）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed mb-3">
                当社は以下の場合、事前の通知なく本サービスの一部または全部を中断・停止することがあります。
              </p>
              <ul className="list-disc list-inside space-y-2 text-nexus-text-secondary ml-6">
                <li>システム保守・点検・更新の実施時</li>
                <li>天災・火災・停電・通信障害等により提供困難な場合</li>
                <li>電気通信事業者の役務が提供されない場合</li>
                <li>本システムの障害・不具合発生時</li>
                <li>API連携先のサービス停止・仕様変更時</li>
                <li>当社が必要と判断した場合</li>
              </ul>
              <p className="text-nexus-text-secondary leading-relaxed mt-3">
                当社は、これにより生じた損害について一切の責任を負いません。
              </p>
            </section>

            {/* 第6条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第6条（出品条件）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                出品者は、商品が合法的に取引可能であることを保証し、必要に応じて古物商許可証を取得していることを確認します。
              </p>
            </section>

            {/* 第7条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第7条（商品情報の正確性）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                出品者は、商品説明、画像、価格等の情報を正確かつ最新の状態に保つ義務を負います。
              </p>
            </section>

            {/* 第8条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第8条（禁止行為）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed mb-3">
                利用者は以下の行為を行ってはなりません。
              </p>
              <ul className="list-disc list-inside space-y-2 text-nexus-text-secondary ml-6">
                <li>不正目的での本サイト利用</li>
                <li>有害プログラムの送信・書き込み</li>
                <li>他者のアカウントの不正使用</li>
                <li>知的財産権の侵害行為</li>
                <li>名誉毀損、誹謗中傷行為</li>
                <li>財産・プライバシー侵害行為</li>
                <li>虚偽または無意味な情報の投稿</li>
                <li>公序良俗に反する情報の公開</li>
                <li>営利目的の利用（当社が認めた場合を除く）</li>
                <li>法令または本規約に違反する行為</li>
                <li>サイト運営の妨害行為</li>
                <li>販売意思のない出品</li>
                <li>商品の重複出品</li>
                <li>不正確なカテゴリへの出品</li>
                <li>偽造品や模倣品の出品</li>
                <li>輸出入起業塾関係者のSNS等による勧誘・斡旋行為</li>
                <li>その他、当社が不適当と判断する行為</li>
              </ul>
            </section>

            {/* 第9条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第9条（売買契約の成立）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                購入者が注文手続きを完了した時点で、出品者と購入者との間で売買契約が成立します。
              </p>
            </section>

            {/* 第10条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第10条（所有権の移転）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                商品の所有権は、購入者が商品を受領した時点で移転します。
              </p>
            </section>

            {/* 第11条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第11条（返品・返金）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                商品に瑕疵がある場合、購入者は商品到着後7日以内又は倉庫スタッフによる検品委託の結果により返品・返金を申請できます。
              </p>
            </section>

            {/* 第12条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第12条（瑕疵の責任）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                倉庫スタッフによる検品において瑕疵を認めた場合には、出品者と購入者間で解決することとし、当社は一切の責任を負わないものとします。
              </p>
            </section>

            {/* 第13条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第13条（有効期間および解約）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>本サービスの利用契約は、登録完了時から開始され、解約手続きが完了するまで継続するものとします。</li>
                <li>利用者が解約を希望する場合は、解約希望月の15日までに当社窓口まで書面またはメールにて連絡するものとします。</li>
                <li>解約手続きが完了した場合でも、解約月末日までは本サービスを利用できるものとします。</li>
                <li>解約時において未払いの料金がある場合、利用者は当該料金を完済するまで解約できないものとします。</li>
              </ol>
            </section>

            {/* 第14条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第14条（手数料および支払い方法）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>利用者は、月額基本料金として5,000円（税別）を支払うものとします。</li>
                <li>出品者は、当社が定める各種手数料を支払うものとします。</li>
                <li>各種手数料は月末に集計し、翌月7日までに当社指定の方法により支払うものとします。</li>
                <li>月額基本料金は、登録月から解約月まで月割り計算は行わず、月単位での課金とします。</li>
                <li>支払いが遅延した場合、当社は本サービスの提供を停止することができるものとします。</li>
              </ol>
            </section>

            {/* 第15条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第15条（保険および補償）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社は、お預かりする商品について、善良な管理者の注意義務をもって保管いたします。</li>
                <li>お預かりする商品は、当社が加入する保険の補償対象外となることもあるため、高額商品の保管を希望する利用者は、自己の責任と費用負担において動産保険等の加入を推奨します。</li>
                <li>当社の責任に帰すべき事由により商品に損害が生じた場合でも、当社の損害賠償責任は、当該商品について利用者が当社に申告した価格または市場価格のいずれか低い額を上限とします。</li>
                <li>ヴィンテージ品、骨董品、美術品等の希少価値のある商品については、その特殊性により保険適用が困難な場合があることを、利用者は予め承諾するものとします。</li>
              </ol>
            </section>

            {/* 第16条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第16条（通知の方法）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社から利用者への通知は、登録されたメールアドレス、電話番号、またはLINE等の当社が指定する連絡手段により行います。</li>
                <li>利用者から当社への連絡は、当社が指定する方法（LINE、メール、電話等）により行うものとします。</li>
                <li>前各項による通知は、送信時をもって到達したものとみなします。</li>
                <li>利用者は、登録情報に変更があった場合、速やかに当社に届け出るものとします。</li>
              </ol>
            </section>

            {/* 第17条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第17条（個人情報の保護）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                当社は、利用者の個人情報を当社のプライバシーポリシーに従い、適切に取り扱います。
              </p>
            </section>

            {/* 第18条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第18条（秘密保持）
              </h2>
              <p className="text-nexus-text-secondary leading-relaxed">
                当社は、利用者の同意がある場合または法令等による場合を除き、サービス提供に際して知り得た会員の秘密情報を第三者に漏洩しません。
              </p>
            </section>

            {/* 第19条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第19条（反社会的勢力の排除）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>利用者は、現在、暴力団、暴力団員、暴力団員でなくなった時から5年を経過しない者、暴力団準構成員、暴力団関係企業、総会屋等、社会運動等標ぼうゴロまたは特殊知能暴力集団等、その他これらに準ずる者（以下「暴力団員等」といいます）に該当しないことを表明し、かつ将来にわたっても該当しないことを確約するものとします。</li>
                <li>利用者は、自らまたは第三者を利用して以下の行為を行わないことを確約するものとします。
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>暴力的な要求行為</li>
                    <li>法的な責任を超えた不当な要求行為</li>
                    <li>取引に関して、脅迫的な言動をし、または暴力を用いる行為</li>
                    <li>風説を流布し、偽計を用いまたは威力を用いて当社の信用を毀損し、または当社の業務を妨害する行為</li>
                    <li>その他前各号に準ずる行為</li>
                  </ul>
                </li>
                <li>利用者が前各項の規定に違反した場合、当社は何らの催告なく直ちに本契約を解除し、これにより利用者に損害が生じても当社は一切の責任を負いません。</li>
              </ol>
            </section>

            {/* 第20条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第20条（当社の責任制限）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社は売買契約の当事者ではなく、商品の瑕疵、不具合、数量不足、未着、輸送事故、詐欺等に起因する損害について一切の責任を負いません。</li>
                <li>システム障害、ウイルス感染、不正アクセス等により生じた損害についても責任を負いません。</li>
                <li>政治的要因、罷業、通貨事情の変動など不可抗力による遅延・不能による損害にも責任を負いません。</li>
                <li>会員に対するアドバイス等について、結果に対する責任は負いません。</li>
                <li>規約違反、時間外対応不可などによる損害についても責任を負いません。</li>
                <li>アカウント不正使用による損害、税関における差押・廃棄、輸入に関する問題による費用は全て利用者負担とします。</li>
                <li>当社が責任を負う場合でも、その責任は当該月に受領した料金総額を上限とします。</li>
                <li>当社の責任は、当社の故意または重大な過失による場合を除き、直接かつ現実に発生した損害に限られます。</li>
              </ol>
            </section>

            {/* 第21条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第21条（サービス内容の変更・追加）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社は、本サービスが新規事業であることから、サービス品質の向上、利用者のニーズへの対応、事業環境の変化等に応じて、サービス内容の変更、追加、または一部廃止を行うことがあります。</li>
                <li>前項に伴い、料金体系、手数料、提供条件等についても随時見直し、変更することがあります。</li>
                <li>サービス内容の重要な変更については、可能な限り事前に利用者に通知するよう努めますが、緊急性がある場合やシステム上の制約等により事前通知が困難な場合は、事後の通知となることがあります。</li>
              </ol>
            </section>

            {/* 第22条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第22条（規約の変更）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>当社は、本サービスが新規事業であり、サービス内容の追加・変更が随時行われることから、それに応じて本規約についても定期的に見直し、改定・補充を行います。</li>
                <li>規約の変更は、法令の改正、サービス内容の変更、利用状況の変化、その他当社が必要と判断した場合に行います。</li>
                <li>変更後の規約は当社ウェブサイトに掲載された時点で効力を生じ、利用者は変更後の規約に従うものとします。</li>
                <li>重要な規約変更については、可能な限り事前に利用者への通知に努めますが、軽微な変更や緊急性を要する変更の場合は事後通知となることがあります。</li>
              </ol>
            </section>

            {/* 第23条 */}
            <section>
              <h2 className="text-xl font-semibold text-nexus-text-primary mb-4">
                第23条（準拠法および管轄）
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-nexus-text-secondary">
                <li>本規約の解釈および適用については、日本法を準拠法とします。</li>
                <li>本サービスに関して生じた紛争については、当社本店所在地を管轄する裁判所を第一審の専属管轄裁判所とします。</li>
              </ol>
            </section>
          </div>
        </NexusCard>
      </div>
    </div>
  );
}



