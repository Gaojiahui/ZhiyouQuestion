
// 从本地缓存 cookie 中取出 petname的值
var petname = $.cookie('petname');

// 点击提问按钮
$("#ask").click(function(){
	petname ? location.href = 'ask.html' : location.href = 'login.html';
})  


// 判断有没有 petname 的值，决定user 的图片样式和行为
if(petname){
	$("#user").find('span').last().text(petname);
}else{
	$("#user").find('span').last().text('登录').end().end().removeAttr('data-toggle').click(function(){
		location.href = 'login.html';
	});
}
// 退出登入
$("#logout").click(function(){
	$.get('/user/logout',function(resData){
		console.log(resData);
		if(resData.code == 1){
			// 重新刷新当前页面
			location.reload();
		}
	})
})

// 给每个问题添加点击事件(不能直接绑定事件，要用委托事件)
$(".questions").on('click','.media[data-question]',function(){
//	alert('我要回答' + $(this).attr('data-question') + '的问题');
	if (petname) {
		// 把 data-question 的值存到 cookie
		$.cookie('question',$(this).data('question'));
		location.href = "answer.html";
	}else{
		location.href = "login.html";
	}
});
// 获取首页数据
$.get('/question/all',function(resData){
	var htmlStr = '';
	for (var i = 0; i < resData.length; i++) {
		// 这里采用bootstarp 里面的 bootstrap 多媒体多想 (Media Object)
		var question = resData[i];
		// 这是外层
		htmlStr += '<div class="media" data-question="'+ new Date(question.time).getTime() +'">'
		// 内层第一块
		htmlStr += '<div class="pull-left"><a>'
		htmlStr += '<img class="media-object" src="../uploads/' + question.petname + '.jpg" onerror="defaultHeaderImage(this)" >'
		htmlStr += '</a></div>'
		// 内层第二块
		htmlStr += '<div class="media-body">'
		htmlStr += '<h4 class="media-heading">' + question.petname + '</h4>'
		htmlStr += question.content
		htmlStr += '<div class="media-footing">' + formatDate(new Date(question.time)) + '&#x3000;'+ formatIp(question.ip) + '</div>'
		htmlStr += '</div>'
		htmlStr += '</div>'
		
		// 判断这个问题是否有答案
		if (question.answers) {
			// 内层for循环，遍历问题的答案
			for (var j = 0; j < question.answers.length; j++) {
				var answer = question.answers[j];
				// 答案的外层
				htmlStr += '<div class="media media-child">'
				// 内层第一块
				htmlStr += '<div class="media-body">'
				htmlStr += '<h4 class="media-heading">' + answer.petname + '</h4>'
				htmlStr += answer.content
				htmlStr += '<div class="media-footing">' + formatDate(new Date(answer.time)) + '&#x3000;' +  formatIp(answer.ip) + '</div>'
				htmlStr += '</div>'
				// 内层第二块
				htmlStr += '<div class="media-right"><a>'
				htmlStr += '<img class="media-object" src="../uploads/' + answer.petname + '.jpg" onerror="defaultHeaderImage(this)" >'
				htmlStr += '</a></div>'
				htmlStr += '</div>'
				
				
			}
		}
		htmlStr += '<hr/>'
	}
	$(".questions").html(htmlStr);

});

// 封装一个方法  ： 解析 date
function formatDate(time){
	var y = time.getFullYear();
	var M = time.getMonth()+1;
	var d = time.getDate();
	var h = time.getHours();
	var m = time.getMinutes();
	M = M < 10? '0'+ M : M;
	d = d < 10? '0'+ d : d;
	h = h < 10? '0'+ h : h;
	m = m < 10? '0'+ m : m;
	// 例如2007-12-12 22:00
	return y + '-' + M + '-' + d + ' ' + h + ':' + m ;
	
};
// 封装一个方法 ： 解析 ip
function formatIp(ip){
	if(ip.startsWith('::1')){
		return 'localhost'
	}else{
		return ip.substr(7);
	}
};

// 如果没有上传头像那么加载
function defaultHeaderImage(that){
	//  这里 that 就是调用这个方法传递过来的 img.media-object 这个标签对象
	that.src = '../images/user.png';
}; 

