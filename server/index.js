const express = require('express')
const app = express()
const port = 5000
const { User } = require('./models/User')
const config = require('./config/key')
const cookieParser = require('cookie-parser');
const { Auth } = require('./middleware/Auth');

//application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
//application/json
app.use(express.json());
app.use(cookieParser());

const mongoose = require('mongoose')
const connect = mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(error => console.log(error));


app.get('/api/hello', (req, res) => {
  res.send('Hello World! 안녕하세요!')
})

app.post('/api/user', (req, res) => {
  //회원 가입 할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);

  user.save((error, userInfo) => {
    if (error) return res.json({ success: false, error });
    return res.status(200).json({
      success: true
    });
  });
})

app.post('/api/user/login', (req, res) => {
  //요청 된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (error, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: '이메일을 다시 입력해주세요.'
      });
    //요청 된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (error, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다."
        });
      //비밀번호까지 맞다면 토큰을 생성
      user.generateToken((error, user) => {
        if (error) return res.status(400).send(error);
        //토큰을 저장한다. (cookie에 x_auth라는 이름으로 토큰이 들어감)
        res.cookie("x_auth", user.token)
          .status(200)
          .json({
            loginSuccess: true,
            userId: user._id
          });
      });
    });
  });
});

app.get('/api/user/auth', Auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    image: req.user.image,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
  })
})

app.get('/api/user/logout', Auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (error, user) => {
    if (error) return res.json({ success: false, error });
    return res.status(200).send({
      success: true
    })
  })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}!`)
})