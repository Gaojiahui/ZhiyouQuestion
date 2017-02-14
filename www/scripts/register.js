
// 返回上一页
$("#goBack").click(function(){
	history.back();
})

//返回主页
$("#home").click(function(){
	location.href="index.html";
})

// 提交表单
$("form").submit(function(event){
	// 阻止默认事件
	event.preventDefault();
	
	
	//比较密码和确认密码是否一致
	var pwds = $("input[type=password]").map(function(){
		return $(this).val();
	});
	if (pwds[0] != pwds[1]) {
		// 两次密码输入不一致
		$(".modal-body").text('两次密码输入不一致，请重新输入');
		$("#myModal").modal('show');
	}
	
	//发送注册请求
	// var data = Formdata(this);  原生获取form数据方法
	var data = $(this).serialize();//  jquery的获取数据方法
	$.post('/user/register',data,function(resData){
		console.log(resData);
		$(".modal-body").text(resData.message);
		$("#myModal").modal('show').on('hide.bs.modal',function(){
			if (resData.code == 3) {
				location.href="login.html";
			}
		});
	});
	
	
});

