
Aadar@Blank MINGW64 /c/project-files/Zenith-app-Max (performance-optimization)
$ npm run build

> zenith-app-max@1.0.0 prebuild
> node scripts/prepare-legacy.mjs

[prepare-legacy] Done: public assets, body HTML, and legacy bundle generated (CSS preserved).

> zenith-app-max@1.0.0 build
> next build

  ▲ Next.js 14.2.35
  - Environments: .env.local

   Creating an optimized production build ...
<w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|javascript/auto|C:\project-files\Zenith-app-Max\node_modules\next\dist\build\webpack\loaders\next-flight-css-loader.js??ruleSet[1].rules[14].oneOf[7].use[0]!C:\project-files\Zenith-app-Max\node_modules\next\dist\build\webpack\loaders\css-loader\src\index.js??ruleSet[1].rules[14].oneOf[7].use[1]!C:\project-files\Zenith-app-Max\node_modules\next\dist\build\webpack\loaders\postcss-loader\src\index.js??ruleSet[1].rules[14].oneOf[7].use[2]!C:\project-files\Zenith-app-Max\app\components\PlayerPreviewMiniPlayerCard.module.css|rsc': No serializer registered for CssSyntaxError
<w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> webpack/lib/ModuleBuildError -> CssSyntaxError
Failed to compile.

./app/components/PlayerPreviewMiniPlayerCard.module.css:55:1
Syntax error: Selector ":global(.dashboard-player-card)" is not pure (pure selectors must contain at least one local class or id)

  53 | 
  54 | /* We use global dashboard-player-card styles, but can tweak dimensions here */
> 55 | :global(.dashboard-player-card) {
     | ^
  56 |   margin: 0 auto !important;
  57 | }


> Build failed because of webpack errors