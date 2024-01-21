import React from 'react'
import './Dashboard.scss'
import Widgets from '../../components/pages/Widgets/Widgets'
import Layout from '../../components/Layout'
import Chart from '../../components/pages/Chart/Chart'

const Dashboard = () => {
  return (
    <Layout>
      <div className='dashboard'>
        <div className='navbarContainer'>
          <div className='widgetContainer'>
            <Widgets type='user' />
            <Widgets type='booking' />
            <Widgets type='revenue' />
          </div>

          <Chart />
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
