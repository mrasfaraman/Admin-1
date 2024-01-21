import React from 'react'
import './Features.scss'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Line, Circle } from 'rc-progress'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import KeyboardArrowDownSharpIcon from '@mui/icons-material/KeyboardArrowDownSharp'
import KeyboardArrowUpSharpIcon from '@mui/icons-material/KeyboardArrowUpSharp'

const Features = () => {
  const percentage = 75
  return (
    <div>
      <div className='feature'>
        <div className='top'>
          <h1 className='title'>Total Revenue</h1>
          <MoreVertIcon fontSize='small' />
        </div>
        <div className='bottom'>
          <div className='bar'>
            <CircularProgressbar value={percentage} text={`${percentage}%`} />
          </div>
          <p className='title'>Total bookings today</p>
          <p className='amount'>14</p>
          <p className='desc'>
            Previous payment processing. Last payment may not be included
          </p>
          <div className='summary'>
            <div className='items'>
              <div className='itemTitle'>Target</div>
              <div className='itemResult negative'>
                <KeyboardArrowDownSharpIcon fontSize='small' />
                <div className='itemAmount'>PKR 420K</div>
              </div>
            </div>
            <div className='items'>
              <div className='itemTitle'>Last Week</div>
              <div className='itemResult positive'>
                <KeyboardArrowUpSharpIcon fontSize='small' />
                <div className='itemAmount'>PKR 420K</div>
              </div>
            </div>
            <div className='items'>
              <div className='itemTitle'>Last Month</div>
              <div className='itemResult positive'>
                <KeyboardArrowUpSharpIcon fontSize='small' />
                <div className='itemAmount'>PKR 420K</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features
