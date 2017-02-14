// 返回上一页
$("#goBack").click(function(){
	history.back();
})

//去注册
$("#register").click(function(){
	location.href="register.html";
})

// 提交表单
$("form").submit(function(event){
	// 阻止默认事件
	event.preventDefault();
	
	//发送登录请求
	// var data = Formdata(this);  原生获取form数据方法
	var data = $(this).serialize();//  jquery的获取数据方法
	$.post('/user/login',data,function(resData){
		console.log(resData);
		$(".modal-body").text(resData.message);
		$("#myModal").modal('show').on('hide.bs.modal',function(){
			if (resData.code == 3) {
				location.href="index.html";
			}
		});
	});
	
	
});