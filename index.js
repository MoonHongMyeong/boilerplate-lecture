const express = require('express')
const app = express()
const port = 5000
const { User } = require('./models/User')
const config = require('./config/key')

//application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
//application/json
app.use(express.json());

const mongoose = require('mongoose')
const connect = mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(error => console.log(error));


app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요!')
})

app.post('/user', (req, res) => {
  //회원 가입 할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);

  user.save((error, userInfo) => {
    if (error) return res.json({ success: false, error });
    return res.status(200).json({
      success: true,
    })
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}!`)
})