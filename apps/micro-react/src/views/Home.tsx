import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>首页</h1>
      <p>这是 React 子应用的首页</p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
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
        <Link
          to="/detail"
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          查看详情
        </Link>
      </div>
    </div>
  )
}

export default Home

