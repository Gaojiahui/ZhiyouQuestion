
// 加载模块
// 服务器构造函数
var express =require('express');
// 解析 post 请求的参数到body对象中
var bodyParser = require('body-parser');
// 处理文件上传
var multer = require('multer');
// 处理文件I/O 写入/读取
var fs = require('fs');
// 处理缓存 cookie 
var cookieParser = require('cookie-parser');

// 创建服务器对象
var app = express();

// 配置存储上传文件 storage
var storage = multer.diskStorage({
	destination:'www/uploads',
	filename:function(req,res,callback){
		var petname = req.cookies.petname;
		callback(null,petname + '.jpg');
	}
})
var upload = multer({storage});
//配置静态文件夹 
app.use(express.static('www'));
// 解析post 请求参数
app.use(bodyParser.urlencoded({extended:true}));
// 解析 cookie 对象
app.use(cookieParser());

/************************************注册************************************************/
app.post('/user/register',function(req,res){
//	console.log(req.body);
	// 先判断有没有user文件夹(实际上是自己手动创建好了，用来保存注册过的用户)
	fs.exists('users',function(exists){
		if(exists){
			// 存在 (写入)
			writeFile();
		}else{
			// 不存在 (创建user)
			fs.mkdir('users',function(err){
				if (err) {
					// 创建失败
					res.status(200).json({code:0,message:'系统创建文件夹失败'});
				} else{
					// 创建成功 (写入)
					writeFile();
				}
			});
		}
	});
	// 封装一个把注册信息写入本地的方法
	function writeFile(){
		// 判断用户是否已经注册过
		// var fileName = `users/${req.body.petname}.txt`;
		var fileName = 'users/' + req.body.petname + '.txt';
		fs.exists(fileName,function(exi){
			if (exi) {
				// 用户存在,已被注册
				res.status(200).json({code:2,message:'用户名已存在'});
			} else{
				// 在body中加入 ip 和 time 属性
				req.body.ip = req.ip;
				req.body.time = new Date();
				// 未被注册，把用户信息写入本地
				fs.writeFile(fileName,JSON.stringify(req.body),function(err){
					if (err) {
						// 写入失败
						res.status(200).json({code:1,message:'系统错误写入文件失败'});
					}else{
						// 保存成功
						res.status(200).json({code:3,message:'注册成功'});
					}
				})
			}
		})
	}
});


/************************************登录************************************************/
app.post('/user/login',function(req,res){
	/* 1.根据 req.petname 去 user 文件夹中匹配文件
		//匹配到
		// 根据req.petname 去 user中 读取
			// 读取失败
			   返回系统错误
			// 读取成功
			  比较 req.password == 读出的那个密码
			  // 如果不相等  
			     返回密码错误  code=2
			  //  如果相等
			  	code=3
		// 匹配不到
		// 返回用户不存在
	*/
	var filename = 'users/' + req.body.petname + '.txt';
	
	fs.exists(filename,function(exi){
		if (exi) {
			fs.readFile(filename,'utf-8',function(err,data){
//				console.log(data); 
				// readFile的第2个参数表示读取编码格式，如果未传递这个参数，表示返回Buffer字节数组 
				if (err) {
					res.status(200).json({code:0,message:'文件读取失败，系统错误'});
				}else{
					if (req.body.password !== JSON.parse(data).password) {
						
						res.status(200).json({code:2,message:'密码错误，请重新输入'});
					}else{
						//把petname 设置到 cookie例(把 petname 存储在当前网站内:1.有利于下次登入 2.保存用户信息)
						// 设置cookie过期时间
						var expires = new Date();
						expires.setMonth(expires.getMonth() + 1);
						res.cookie('petname',req.body.petname,{expires});
						res.status(200).json({code:3,message:'登入成功'});
					};
				};
			});
		} else{
			res.status(200).json({code:1,message:'用户不存在'});
		}
	});
});


/**************************************提问**********************************************/
app.post('/question/ask',function(req,res){
	//判断有没有在 cookie 中吧petname传递过来
	if(!req.cookies.petname){
		//比如确实登录了，但是某些清除垃圾的软件吧储存的cookie清除了。更或者
		//你自己吧cookie清除了（时间戳到了）
		res.status(200).json({code:0,message:'登录异常，请重新登录'});
		return;
	}
	
	//判断questions文件夹是否存在
	fs.exists('questions',function(exi){
		if(exi){
			//文件夹存在（写入文件）
			writeFile();
		}else{
			//不存在（需要创建）
			fs.mkdir('questions',function(err){
				if(err){
					//创建文件夹失败
					res.status(200).json({code:0,message:'系统创建文件夹失败'});
				}else{
					//创建成功（写入文件）
					writeFile();
				}
			})
		}
	});
	//封装写入问题的方法
		function writeFile(){
			//生成提问问题的文件名
			var data = new Date();
			var fileName = 'questions/'+ data.getTime()+'.txt';
			//生成存储信息
			req.body.petname=req.cookies.petname;
			req.body.ip = req.ip;
			req.body.time = data;
			//写入文件
			fs.writeFile(fileName,JSON.stringify(req.body),function(err){
				if(err){
					//写入失败
					res.status(200).json({code:1,message:'系统错误写入文件失败'});
				}else{
					//写入成功
					res.status(200).json({code:2,message:'提交问题成功'})
				}
			});
		}
});

/*************************************退出登入*********************************************/
app.get('/user/logout',function(req,res){
	// 清楚 cookie数据的 petname
	res.clearCookie('petname');
	res.status(200).json({code:1,message:'退出登入成功'});
});




/*************************************首页数据*********************************************/
app.get('/question/all',function(req,res){
	//返回所有的问题(包含回答)
	fs.readdir('questions',function(err,files){
//		console.log(files);
		if (err) {
			// 读取文件失败
			res.status(200).json({code:0,message:'读取文件失败'});
		}else{
			//读取文件成功
			//数组反序  目的：让最新提问的问题排在最前面
			files = files.reverse();
			// 创建一个数组容器  存放所有的问题对象
			var questions = [];
			// 方法一：用for循环管来遍历文件，用同步来读取文件内容
			
			for(var i = 0; i < files.length; i++){
				var file = files[i];
				var filePath = 'questions/' + file;
				// readFile :是一个异步读取文件的方法，可能导致的结果是，还没读取就 res 了，没有数据。
				var data = fs.readFileSync(filePath);
				var obj = JSON.parse(data);
				questions.push(obj);
			}
			res.status(200).json(questions);
		
			
			// 方法二：用递归来遍历文件，用异步读取文件
			/*var i = 0;
			function readFile(){
				if (i < files.length) {
					var file = files[i];
					var filePath = 'questions/' + file;
					fs.readFile(filePath,function(err,data){
						if (!err) {
							var obj = JSON.parse(data);
							questions.push(obj);
							i++;
							readFile();
						}
					})
				}else{
					res.status(200).json(questions);
				}
			}
			readFile();*/
		}
	});
});
/*************************************回答问题*********************************************/
app.post('/question/answer',function(req,res){
	// 判断登入了没
	var petname = req.cookies.petname;
	if (!petname) {
		res.status(200).json({code:0,message:'登录异常，请重新登录'});
		return;
	}
	
	// 先取出要回答问题的内容
	var question = req.cookies.question;
	var filePath = 'questions/' + question + '.txt';
	fs.readFile(filePath,function(err,data){
		if (!err) {
			var dataObj = JSON.parse(data);
			// 判断有没有 answers 属性(有：之前回答过  没有：就是直接没回答过)
			if (!dataObj.answers) {
				// 创建
				dataObj.answers = [];
				
			}
			// 把答案对象(ip,time,petname,content) push  进去
			// 防止跨网站攻击
			req.body.content = req.body.content.replace(/</g,'&lt;')
			req.body.content = req.body.content.replace(/>/g,'&gt;')
			req.body.ip = req.ip;
			req.body.question = question;
			req.body.time = new Date();
			req.body.petname = petname;
			// dataObj push到answers
			dataObj.answers.push(req.body);
			fs.writeFile(filePath,JSON.stringify(dataObj),function(err){
				if (err) {
					//写入失败
					res.status(200).json({code:1,message:'系统错误写入文件失败'});
				} else{
					// 写入成功
					res.status(200).json({code:2,message:'提交答案成功'});
					
				}
			})
		}
	})
});

/*************************************上传头像*********************************************/
app.post('/user/photo',upload.single('photo'),function(req,res){
	res.status(200).json({code:0,message:'上传头像成功'});
})
// 添加端口
app.listen(3000,function(){
	console.log('服务器开启成功');
})
