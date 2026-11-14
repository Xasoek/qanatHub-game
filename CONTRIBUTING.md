# Работа в команде

1. Владелец репозитория открывает **Settings → Collaborators → Add people** и приглашает участников по GitHub-никам. Участники принимают приглашение перед клонированием. [Инструкция GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)
2. Для первой задачи переключитесь на ветку своей роли. Например, для роли 2:

   ```bash
   git fetch origin
   git switch --track origin/role-2/ui
   git merge origin/main
   ```

   Для следующих задач создавайте новую ветку от актуальной `main`, например `git switch -c role-2/intro origin/main` после `git fetch origin`.

3. Меняйте файлы своей роли из [таблицы в README](README.md#кто-за-что-отвечает). Если задача меняет общий контракт, согласуйте изменение с ролью 5 и владельцами затронутых модулей. Обновите [контракты](CONTRACTS.md) и зависимых потребителей в том же PR или в согласованной последовательности.
4. Перед отправкой выполните `npm test` и `npm run build`, откройте `index.html` без сети. Добавьте в коммит исходники и сгенерированный файл.

   ```bash
   git add src/ui.js src/art.js src/style.css index.html
   git commit -m "Build the Mars base interface"
   git push -u origin HEAD
   ```

5. Откройте pull request в `main`. Укажите роль, изменения в контракте и как их проверить. После объединения другого PR обновите свою ветку через `git fetch origin` и `git merge origin/main`. Если конфликтует только `index.html`, сначала уладьте изменения в исходниках, затем выполните `npm run build` и добавьте заново сгенерированный файл.
6. Роль 5 проверяет **Build and smoke checks**, открывает сборку на контрольной точке и объединяет PR. Если включаете защиту `main`, можно сделать обязательной проверку `smoke` после её первого успешного запуска. [Ветки и защита в GitHub](https://docs.github.com/en/pull-requests/reference/branches)
