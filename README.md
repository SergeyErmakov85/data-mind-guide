# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Проверка доступности (a11y)

Проект следует базовым требованиям WCAG 2.1 AA:

- **Skip-link** «Перейти к содержимому» — первый focusable элемент на каждой странице (`#main-content`).
- **Focus-ring**: `outline: 3px solid hsl(var(--ring))` с `outline-offset: 2px` на всех интерактивных элементах (см. `src/index.css`).
- **Слайдеры** (Radix Slider) экспонируют корректный `aria-valuetext` с единицами (`α = 0.05`, `μ = 100`, и т.д.) — см. `src/components/ui/slider.tsx`.
- **Графики**: каждая SVG-визуализация обёрнута в `<ChartA11y>` (`role="img"` + `aria-label` + `aria-live` summary) — см. `src/components/ChartA11y.tsx`.
- **Reduced motion**: глобальный `@media (prefers-reduced-motion: reduce)` + хук `usePrefersReducedMotion()` из `src/lib/a11y.ts` для всех framer-motion анимаций.
- **Контраст**: текст на основном фоне ≥ 4.5:1; `.glass` / `.glass-dialog` форсируют непрозрачный `--foreground`.

### Запуск автоматической проверки axe-core

`package.json` в Lovable read-only, поэтому используйте `npx` напрямую:

```sh
# 1) Запустите dev-сервер в одной вкладке:
npm run dev

# 2) В другой вкладке прогоните axe-core CLI:
npx -y @axe-core/cli http://localhost:8080 \
  --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
  --exit
```

Для прохода по нескольким страницам:

```sh
npx -y @axe-core/cli \
  http://localhost:8080 \
  http://localhost:8080/theory \
  http://localhost:8080/labs/ttest \
  http://localhost:8080/glossary \
  --tags wcag2a,wcag2aa --exit
```

Эквивалентный alias (если вы хотите положить его себе в `~/.bashrc`):

```sh
alias a11y:check='npx -y @axe-core/cli http://localhost:8080 --tags wcag2a,wcag2aa,wcag21a,wcag21aa --exit'
```

Команда вернёт код `1` при наличии нарушений и распечатает список проблем с селекторами и ссылками на правила.

