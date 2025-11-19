import { Link } from 'react-router-dom'

const Page2 = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>页面 2</h1>
      <p>这是页面 2 的内容</p>
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
          to="/page1"
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          跳转到页面1
        </Link>
      </div>
    </div>
  )
}

export default Page2

