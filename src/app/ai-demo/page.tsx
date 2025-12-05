import { AIChat } from '@/components/ai/AIChat'
import { supabase } from '@/lib/supabase'
import { Bot, Sparkles, Brain, TrendingUp, Zap } from 'lucide-react'

export default async function AIDemoPage() {
  // Fetch properties for the AI chat
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .limit(10)

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy to-navy-light py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <Sparkles className="w-10 h-10 text-gold" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">LuxEstate AI</span> Assistant
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Revoluční umělá inteligence pro vaše realitní hledání. 
            Najděte ideální nemovitost pomocí konverzace s AI expertem.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Inteligentní doporučení</h3>
            <p className="text-white/60">
              AI analyzuje vaše požadavky a doporučuje nejvhodnější nemovitosti s procentuální shodou.
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-gold/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-gold" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Analýza trhu</h3>
            <p className="text-white/60">
              Získejte přehled o cenových trendech, poptávce a investičních příležitostech.
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Rychlé odpovědi</h3>
            <p className="text-white/60">
              Okamžité odpovědi na vaše dotazy ohledně nemovitostí, financování a právních aspektů.
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500/20 to-gold/20 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Personalizace</h3>
            <p className="text-white/60">
              AI se učí z vašich preferencí a přizpůsobuje doporučení vašim specifickým potřebám.
            </p>
          </div>
        </div>

        {/* Demo section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* AI Chat Demo */}
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Živá ukázka</h2>
                <p className="text-white/60">Vyzkoušejte si AI Assistant přímo zde</p>
              </div>
            </div>
            
            <div className="h-[600px] rounded-2xl overflow-hidden border border-white/10">
              <AIChat properties={properties || []} initialOpen={true} />
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl">
              <h4 className="font-bold text-lg mb-3">💡 Tipy pro použití</h4>
              <ul className="space-y-2 text-white/70">
                <li>• Zeptejte se na konkrétní nemovitosti ("Najdi byt v Brně do 5M")</li>
                <li>• Požádejte o srovnání nemovitostí</li>
                <li>• Zeptejte se na realitní terminologii</li>
                <li>• Požádejte o rady ohledně investic</li>
              </ul>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-8">
            <div className="glass rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-6">Jak AI Assistant funguje</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Analýza požadavků</h4>
                    <p className="text-white/60">
                      AI rozumí přirozenému jazyku a extrahuje klíčové parametry z vašich dotazů.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Vyhledávání v databázi</h4>
                    <p className="text-white/60">
                      Prohledává tisíců nemovitostí a hodnotí shodu na základě vašich kritérií.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-gold/20 to-gold/10 flex items-center justify-center">
                    <span className="text-gold font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Generování odpovědí</h4>
                    <p className="text-white/60">
                      Vytváří personalizované odpovědi s doporučeními a odůvodněním.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Kontinuální učení</h4>
                    <p className="text-white/60">
                      AI se zlepšuje s každou interakcí, aby poskytovala přesnější doporučení.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-gradient mb-2">95%</div>
                <div className="text-white/60">Přesnost doporučení</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-gradient mb-2">{"<2s"}</div>
                <div className="text-white/60">Rychlost odpovědi</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-gradient mb-2">24/7</div>
                <div className="text-white/60">Dostupnost</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-gradient mb-2">10k+</div>
                <div className="text-white/60">Analyzovaných nemovitostí</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block gradient-border p-1 rounded-3xl">
            <div className="bg-navy rounded-3xl px-12 py-8">
              <h3 className="text-3xl font-bold mb-4">
                Začněte konverzaci s AI Assistantem
              </h3>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                Klikněte na tlačítko AI v pravém dolním rohu jakékoli stránky 
                a nechte si pomoci najít vaši vysněnou nemovitost.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-xl font-bold text-white transition-all duration-300">
                  Vyzkoušet AI Demo
                </button>
                <button className="px-8 py-4 glass hover:bg-white/10 rounded-xl font-bold text-white transition-all duration-300">
                  Více o technologii
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
