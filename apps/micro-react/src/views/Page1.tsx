import { Link } from 'react-router-dom'

const Page1 = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>页面 1</h1>
      <p>这是页面 1 的内容</p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Link
          to="/"
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          返回首页
        </Link>
        <Link
          to="/page2"
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          跳转到页面2
        </Link>
      </div>
    </div>
  )
}

export default Page1

