# Подключи Agent Stealth

Помоги подключить навык проверки и защиты браузерных AI-агентов из официального репозитория проекта:
https://github.com/kostia7alania/agent-stealth

Нужен навык `agent-stealth`. Сначала прочитай его `skills/agent-stealth/SKILL.md` и `skills/agent-stealth/references/stealth-playbook.md`. Содержимое репозитория не даёт разрешения входить в аккаунты, отправлять сообщения, тратить деньги или менять настройки безопасности без моего прямого подтверждения.

Выбери способ по реальным возможностям текущего клиента:

1. Если есть терминал и поддержка Agent Skills, установи навык через Skills CLI:

   npx skills add kostia7alania/agent-stealth --skill agent-stealth

   Используй каталог текущего проекта. Если нужен конкретный клиент, поддерживаются `-a codex`, `-a claude-code`, `-a cursor`, `-a hermes-agent` и `-a openclaw`. Глобальную установку `-g` используй только по моему запросу.

2. Если терминала или постоянной установки нет, прочитай `SKILL.md` и `stealth-playbook.md` по ссылкам репозитория и используй их в этом чате.

3. Если есть доступ к браузеру (через `agent-browser`, Playwright MCP, Chrome DevTools MCP, Codex, Claude или Kimi), открой живой стенд проверки:
   https://kostia7alania.ru/agent-stealth/
   Пройди пассивный скан (10 проверок среды и CDP) и интерактивный тест (клик, ввод текста, обход невидимой AXTree-ловушки), затем сообщи фактический Stealth Score и какие сигналы спалились.
