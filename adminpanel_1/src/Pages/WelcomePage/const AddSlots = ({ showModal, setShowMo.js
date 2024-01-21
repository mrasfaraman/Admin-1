const AddSlots = ({ showModal, setShowModal }) => {
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedTime, setSelectedTime] = useState(0)
  const [selectTime, setSelectTime] = useState()

  const handleGameSelect = (game) => {
    setSelectedGame(game)
  }

  const sports = ['Cricket', 'Football', 'Hockey', 'Volleyball']

  const handleTimeChange = (time) => {
    setSelectedTime(time)
  }

  const handleTimeChange2 = (time) => {
    setSelectTime(time)
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target

    if (checked) {
      setSelectedDays([...selectedDays, value])
    } else {
      setSelectedDays(selectedDays.filter((day) => day !== value))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const game = selectedGame
    const price = event.target.price.value
    const startTime = selectedTime
    const endTime = selectTime

    if (
      !game ||
      !price ||
      !startTime ||
      !endTime ||
      selectedDays.length === 0
    ) {
      alert('Please enter all fields.')
      return
    }

    const submittedData = {
      game,
      price,
      startTime,
      endTime,
      days: selectedDays,
    }
    console.log(submittedData)

    slots = [...slots, submittedData]
    setShowModal(false)
  }

  return (
    <>
      <Container>
        <Form className='mx-auto p-5' onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Dropdown>
                <Dropdown.Toggle id='sports-dropdown'>
                  {selectedGame || 'Select a sports'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {sports.map((game) => (
                    <Dropdown.Item
                      key={game}
                      onClick={() => handleGameSelect(game)}
                    >
                      {game}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col>
              <Form.Group controlId='price'>
                <Form.Label>Set Price(PKR)</Form.Label>
                <Form.Control
                  type='number'
                  placeholder='Enter your price'
                  name='price'
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className='hours'>
            <Col>
              <Form.Group controlId='startTime'>
                <Form.Label>Start time:</Form.Label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DemoContainer components={['TimePicker']}>
                    <TimePicker
                      label='StartTime'
                      value={selectedTime}
                      onChange={handleTimeChange}
                      step={15}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='endTime'>
                <Form.Label>End time:</Form.Label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DemoContainer components={['TimePicker']}>
                    <TimePicker
                      label='EndTime'
                      value={selectTime}
                      onChange={handleTimeChange2}
                      step={15}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Form.Group>
            </Col>
          </Row>

          <Row className='day'>
            <Col>
              <Form.Label>Set Days</Form.Label>
            </Col>
          </Row>
          {[0, 1, 2].map((rowIndex) => (
            <Row key={rowIndex}>
              {[
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ]
                .slice(rowIndex * 3, (rowIndex + 1) * 3)
                .map((day, index) => (
                  <Col key={index} xs={4}>
                    <Form.Check
                      type='checkbox'
                      id={`day-checkbox-${rowIndex}-${index}`}
                      label={day}
                      value={day}
                      checked={selectedDays.includes(day)}
                      onChange={handleCheckboxChange}
                    />
                  </Col>
                ))}
            </Row>
          ))}

          <Button className='button' variant='primary' type='submit'>
            Submit
          </Button>
        </Form>
      </Container>
    </>
  )
}
