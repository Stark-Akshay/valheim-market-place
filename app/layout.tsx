import './globals.css'

export const metadata = {
  title: 'Valheim Marketplace',
  description: 'Server marketplace for trading items with coins',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}