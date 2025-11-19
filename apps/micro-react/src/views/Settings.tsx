import { Link } from 'react-router-dom'

const Settings = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>设置页</h1>
      <p>这是设置页的内容</p>
      <div style={{ marginTop: '1rem' }}>
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
      </div>
    </div>
  )
}

export default Settings

