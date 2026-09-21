// Функция получения HTML Node'ов по обычной строке
export const getNodesFromString = (html: string) => {
  const template = document.createElement('div')
  template.innerHTML = html
  return template.childNodes
}

// Функция  установки темы
export const setupTheme = (theme: 'auto'|'light'|'dark') => {
  // Удаляем старую тему
  document.documentElement.classList.remove('light', 'dark')
  const metaTags = document.head.querySelectorAll('[name="theme-color"]')
  for(const metaTag of metaTags) metaTag.remove()

  // Устанавливаем новую тему
  switch (theme) {
  case 'light':
  case 'dark':
    // Если тёмная или светлая
    document.documentElement.classList.add(theme)
    getNodesFromString(
      `<meta name="theme-color" content="#${theme == 'light' ? 'fff' : '000'}">`
    ).forEach(node => {
      document.head.appendChild(node)
    })
    return
  case 'auto':
    // Если автоматическая
    getNodesFromString(
      '<meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)">' +
      '<meta name="theme-color" content="#000" media="(prefers-color-scheme:  dark)">'
    ).forEach(node => {
      document.head.appendChild(node)
    })
    return
  }
}
