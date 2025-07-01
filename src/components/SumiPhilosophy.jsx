import React from 'react';

const SumiPhilosophy = () => {
  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">墨</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-foreground m-0">Sumi</h1>
              <p className="text-primary font-medium m-0">The Art of Intentional Finance</p>
            </div>
          </div>
        </div>

        {/* Main Philosophy */}
        <div className="text-center">
          <p className="text-lg italic leading-relaxed">
            "Just as a Sumi master achieves perfect balance with deliberate brushstrokes, 
            <br />Sumi Finance helps you achieve financial harmony through mindful, intentional money management."
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold flex items-center space-x-2">
              <span>🖌️</span>
              <span>Simplicity over Complexity</span>
            </h3>
            <p className="text-sm">
              Strip away financial clutter to see what truly matters. Like a Sumi painting, 
              beauty lies in what you include and what you leave out.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-semibold flex items-center space-x-2">
              <span>✨</span>
              <span>Intentional Action</span>
            </h3>
            <p className="text-sm">
              Every financial decision is a deliberate brushstroke on your wealth canvas. 
              No accidental spending, only conscious choices.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-semibold flex items-center space-x-2">
              <span>⚖️</span>
              <span>Balance & Flow</span>
            </h3>
            <p className="text-sm">
              Like ink flowing on rice paper, money should move with purpose and grace. 
              Find harmony between earning, spending, and saving.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-semibold flex items-center space-x-2">
              <span>🎯</span>
              <span>Mindful Minimalism</span>
            </h3>
            <p className="text-sm">
              Focus on essential financial goals, eliminate the unnecessary. 
              True wealth comes from having enough, not having everything.
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="bg-primary/5 rounded-lg p-6 border-l-4 border-primary/30">
          <blockquote className="text-center italic">
            <p className="text-sm mb-2">
              "In Sumi, the empty space is as important as the ink.<br />
              In finance, knowing when NOT to spend is as valuable as knowing when to invest."
            </p>
            <footer className="text-xs text-muted-foreground">
              — The Sumi Philosophy
            </footer>
          </blockquote>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-3">
          <h4 className="text-foreground font-semibold">Begin Your Practice</h4>
          <p className="text-sm">
            Transform your relationship with money. Start your journey toward financial mindfulness today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SumiPhilosophy;