import { Link, useNavigate } from 'react-router-dom'

const Detail = () => {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '2rem' }}>
      <h1>详情页</h1>
      <p>这是详情页的内容</p>
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
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          返回上一页
        </button>
      </div>
    </div>
  )
}

export default Detail

