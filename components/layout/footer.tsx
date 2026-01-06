export function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="site-footer">
      © {currentYear} Sakon Nakhon Primary Educational Service Area Office 1
    </footer>
  )
}

