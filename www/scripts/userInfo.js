
// 返回上一页
$("#goBack").click(function(){
	history.back();
})

//返回主页
$("#home").click(function(){
	location.href="index.html";
})

// 上传头像的请求
$("form").submit(function(e){
	e.preventDefault();
	// 获取表单数据
	//var data = $(this).serialize();
	var data = new FormData(this);
	console.log(data);
	$.post({
		url:'/user/photo',
		data:data,
		contentType:false,
		processData:false,
		success:function(resData){
			$(".modal-body").text(resData.message);
			$("#myModal").modal('show');
		}
	});
})