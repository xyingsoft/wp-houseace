$(document).ready(function() {

	$(".quote_option").click(function(){
		var templateId = $(this).attr('data-template'),
			projectId = $(this).attr('data-project'),
			projectName = $(this).attr('data-name');

		$('#startProject input').attr('placeholder', projectName + ' name...').val(projectName);
		$('.startProject').attr('data-project',projectId).attr('data-template',templateId);
	});

	$('.startProject').click(function(){
		showLoader();
		var templateId = $(this).attr('data-template'),
			projectId = $(this).attr('data-project'),
			projectName = $('#startProject input[name=roomName]').val(),
			projectLevel = $('#startProject select[name=level]').val(),
      agentToken = $(this).attr('data-token'),
			url = '/add_quote/step2';

		$.redirect(url,{ projectId: projectId, templateId: templateId, projectName: projectName, projectLevel: projectLevel, agentToken: agentToken});
	});

	$('.resetProject').click(function(){
		var projectId = $(this).attr('data-project'),
			url = '/add_quote';
		$.redirect(url,{ projectId: projectId });
		//window.location.replace(url + '?projectId=' + projectId);
	});
	
	
	let calculateQuoteTotal = () => {
		if($(this).data('notCallCalculating')) return;
		
        var url = "/wp-content/themes/go/quote-templates-v2/ajax/calculateQuote.php";
		$.ajax({
			type: 'post',
			url: url,
			data: $('form#projectDetailsForm').serialize()
        }).done(function(res) {
			res = JSON.parse(res);
			$('#total-quote').html(`\$${res.message}`);
			$('input[name="projectPrice"]').val(res.message);
        }).fail(function() {
          console.log('fail');
        });
    };
	$('form#projectDetailsForm').on('change', 'input', calculateQuoteTotal);
	$('form#projectDetailsForm').on('click', 'i.icon.wb-plus, i.icon.wb-minus', calculateQuoteTotal);
	
	/*$(".sticky-sidebar").css('z-index', 200);
	$(".sticky-sidebar").stick_in_parent({
		'parent': $('.container'),
		'offset_top': 70
	});*/

	$('.gotoStep3').click(function(){
		showLoader();
		$('form#projectDetailsForm').submit();
	});

	$('.backStep2').click(function(){
		history.back(1);
	});

	// check Login or Register to show for unregistered users
	$('input[name=quote_guest]').change(function(){
		var action = $(this).val();
		if(action == 'tryLogin') {
			$('.tryRegister').hide();
			$('.tryLogin').fadeIn();
		}
		else if (action == 'tryRegister') {
			$('.tryLogin').hide();
			$('.tryRegister').fadeIn();
		}
	});

	// doLogin function on step 3
	$('.doLogin').click(function(){
		doLogin();
	});
	$('.tryLogin').keypress(function(e) {
	    if(e.which == 13) {
	        doLogin();
	    }
	});

	// doRegister function on step 3
	$('.doRegister').click(function(){
		doRegister();
	});
	$('.tryRegister').keypress(function(e) {
	    if(e.which == 13) {
	        doRegister();
	    }
	});


	// check fromContacts or fromNew on step3
	$('#personalDetailsForm').on('change','input[name=selectClient]',function(){
		var action = $(this).val();
		if(action == 'fromContacts') {
			$('.fromNew').hide();
			$('.fromContacts').fadeIn();
		}
		else if (action == 'fromNew') {
			$('.fromContacts').hide();
			$('.fromNew').fadeIn();
		}
	});

	$('#responseSuccess').on('click','.finishProject',function(){
		finishProject('0');
	});


	// new Client creation in popup on step 3
	$('#responseSuccess').on('click','.registerClient', function(){
		registerClient();
	});
	$('#responseSuccess').on('keypress', function(e){
	    if(e.which == 13) {
	        registerClient();
	    }
	});

//Step 2 pager
	
	if($('.form-substep-step2').size() > 0){
		$('.pager li a.next').click(function(e){
			next();
		});
		$('.pager li a.previous').click(function(e){
			previous();
		});
		
		goToStep2Substep(0);
	}
});


function previous(){
	let goToSubstep = parseInt($('.pager').data("curr")) - 1;
	goToStep2Substep(goToSubstep);
}

function next(){
	let goToSubstep = parseInt($('.pager').data("curr")) + 1;
	goToStep2Substep(goToSubstep);
}

function goToStep2Substep(substep) {	
	let numStep2Substeps = $('.form-substep-step2').size(),
		perStep = 1,
		startAt = substep * perStep,
		endOn = startAt + perStep;
  
	$('.form-substep-step2').hide().slice(startAt, endOn).show();
	$('.pager').data("curr",substep);
	$('.pager li a').show();
	if((substep+1)*perStep >= numStep2Substeps){
		$('.pager li a.next').hide();
	}
	else{
		$('.pager li a.gotoStep3').hide();
	}
	if(substep == 0 ) $('.pager li a.previous').hide();
  if((substep == 0 )){
		$('.pager li a.start').show();
	}
	else{
		$('.pager li a.start').hide();
	}
}

function validateEmail($email) {
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	return emailReg.test( $email );
}

function goto2step(templateId) {
	var url = '/add_quote/step2';
	$.redirect(url,{ projectId: '0', templateId: templateId, projectName: ''});
}

function refreshStep3(projectId) {
	showLoader();
	var url = "/wp-content/themes/go/quote-templates-v2/views/step_3_users.php",
		projectId = projectId;
   	 	jQuery.ajax({
      	  	url: url,
       	 	type: "POST",
      	  	dataType: "html",
			data: {'projectId' : projectId},
       	 	success: function(response) {
       	 		$('.authTabs').remove();
			    $('.tryLogin').remove();
			    $('.tryRegister').remove();
				$("#responseSuccess").html(response);
				if(projectId != '0') {
					finishProject(projectId);
				}
				else {
					removeLoader();
				}
   		 	},
    		error: function(response) {
				$("#responseSuccess").html(response);
    		}
  	  	});
}

function showLoader() {
	$('.quoteOverlay').fadeIn();
}
function removeLoader() {
	$('.quoteOverlay').fadeOut();
}

function doLogin() {
	$('.loginButton').html("<i class='fa fa-refresh fa-spin'></i>").removeClass('doLogin');
	var url = "/wp-content/themes/go/quote-templates-v2/ajax/doLogin.php",
		projectId = $('input[name=projectId]').val(),
		loginEmail = $('input[name=loginEmail]').val(),
		loginPassword = $('input[name=loginPassword]').val();

		// let's validate form
		$("#registerFail").html('');
		var validate = true;
		if(loginEmail.length<1) {
            $("#loginFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Login can't be blank!</div>");
            validate = false;
        }
        if(loginPassword.length<1) {
            $("#loginFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Password can't be blank!</div>");
            validate = false;
        }
        if(validate == false) {
        	$('.loginButton').html("Sign In").addClass('doLogin');
        	return false;
        }

	 	jQuery.ajax({
  	  	url: url,
   	 	type: "POST",
		dataType: 'json',
		cache: false,
		data: {
			'projectId' : projectId,
			'loginPassword' : loginPassword,
			'loginEmail' : loginEmail
		},
   	 	success: function(response) {
   	 			//console.log(response);
		        $('.loginButton').html("Sign In").addClass('doLogin');
		        if(response.status == 'fail') {
		        	$('#loginFail').html(response.message);
		        }
		        else if(response.status == 'success') {
		        	$('#loginFail').html(response.message);
		        	refreshStep3(response.projectId);
		        }

		 	},
		error: function(response) {
		        $('.loginButton').html("Sign In").addClass('doLogin');
		        $('#loginFail').html("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Something went wrong!</div>");
	  		}
	  	});
}

function doRegister() {
	$('.registerButton').html("<i class='fa fa-refresh fa-spin'></i>").removeClass('doRegister');
	var url = "/wp-content/themes/go/quote-templates-v2/ajax/doRegister.php",
		projectId = $('input[name=projectId]').val(),
		registerFirstName = $('input[name=registerFirstName]').val(),
		registerLastName = $('input[name=registerLastName]').val();
		registerAddress = $('input[name=registerAddress]').val();
		registerPhone = $('input[name=registerPhone]').val();
		registerEmail = $('input[name=registerEmail]').val();
		registerPassword = $('input[name=registerPassword]').val();

		// let's validate form
		$("#registerFail").html('');
		var validate = true;
		if(registerFirstName.length<1) {
            $("#registerFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>First Name can't be blank!</div>");
            validate = false;
        }
        if(registerPhone.length<1) {
            $("#registerFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Phone can't be blank!</div>");
            validate = false;
        }
        if(registerEmail.length<1) {
            $("#registerFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Email can't be blank!</div>");
            validate = false;
        }
        if(!validateEmail(registerEmail)){
        	$("#registerFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Enter valid Email!</div>");
            validate = false;
        }
        if(registerPassword.length<1) {
            $("#registerFail").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Password can't be blank!</div>");
            validate = false;
        }
        if(validate == false) {
        	$('.registerButton').html("Sign Up").addClass('doRegister');
        	return false;
        }

	 	jQuery.ajax({
  	  	url: url,
   	 	type: "POST",
		dataType: 'json',
		cache: false,
		data: {
			'projectId' : projectId,
			'registerFirstName' : registerFirstName,
			'registerLastName' : registerLastName,
			'registerAddress' : registerAddress,
			'registerPhone' : registerPhone,
			'registerEmail' : registerEmail,
			'registerPassword' : registerPassword
		},
   	 	success: function(response) {
   	 			//console.log(response);
		        $('.registerButton').html("Sign Up").addClass('doRegister');
		        if(response.status == 'fail') {
		        	$('#registerFail').html(response.message);
		        }
		        else if(response.status == 'success') {
		        	$('#registerFail').html(response.message);
		        	refreshStep3(response.projectId);
		        }

		 	},
		error: function(response) {
		        $('.registerButton').html("Sign Up").addClass('doRegister');
		        $('#registerFail').html("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Something went wrong!</div>");
	  		}
	  	});
}

function registerClient() {
	$('.registerClientButton').html("<i class='fa fa-refresh fa-spin'></i>").removeClass('registerClient');
	var url = "/wp-content/themes/go/quote-templates-v2/ajax/registerClient.php",
		registerFirstName = $('input[name=registerFirstName]').val(),
		registerLastName = $('input[name=registerLastName]').val();
		registerAddress = $('input[name=registerAddress]').val();
		registerPhone = $('input[name=registerPhone]').val();
		registerEmail = $('input[name=registerEmail]').val();

		// let's validate form
		$("#createClientResponse").html('');
		var validate = true;
		if(registerFirstName.length<1) {
            $("#createClientResponse").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>First Name can't be blank!</div>");
            validate = false;
        }
        if(registerLastName.length<1) {
            $("#createClientResponse").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Last Name can't be blank!</div>");
            validate = false;
        }
        if(registerPhone.length<1) {
            $("#createClientResponse").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Phone can't be blank!</div>");
            validate = false;
        }
        if(registerEmail.length<1) {
            $("#createClientResponse").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Email can't be blank!</div>");
            validate = false;
        }
        if(!validateEmail(registerEmail)){
        	$("#createClientResponse").append("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Enter valid Email!</div>");
            validate = false;
        }
        if(validate == false) {
        	$('.registerClientButton').html("Sign Up").addClass('registerClient');
        	return false;
        }

	 	jQuery.ajax({
  	  	url: url,
   	 	type: "POST",
		dataType: 'json',
		cache: false,
		data: {
			'registerFirstName' : registerFirstName,
			'registerLastName' : registerLastName,
			'registerAddress' : registerAddress,
			'registerPhone' : registerPhone,
			'registerEmail' : registerEmail
		},
   	 	success: function(response) {
   	 			//console.log(response);
		        $('.registerClientButton').html("Create").addClass('registerClient');
		        if(response.status == 'fail') {
		        	$('#createClientResponse').html(response.message);
		        }
		        else if(response.status == 'success') {
		        	$('select[name=projectClient]').append($("<option></option>").attr("value",response.clientId).text(response.clientName).attr('selected','selected'));
		        	$('.selectpicker').selectpicker('refresh');
		        	$('.close').click();
		        }

		 	},
		error: function(response) {
		        $('.registerClientButton').html("Create").addClass('registerClient');
		        $('#createClientResponse').html("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Something went wrong!</div>");
	  		}
	  	});
}

function finishProject(projectId) {
	var url = "/wp-content/themes/go/quote-templates-v2/ajax/finishProject.php",
		projectClient = $('select[name=projectClient]').val(),
		projectData = $( "form#personalDetailsForm" ).serialize();

	// validation of Client only if newProject
	if(projectId == '0') {
		if(projectClient == '0') {
			alert('You need to select client!');
			$('.finishButton').html("Finish Project").addClass('finishProject');
			return false;
		}
	}

	if(projectId == '0') {
		showLoader();
	}

	$('#finishProjectResponse').html('');
	jQuery.ajax({
	  	url: url,
	 	type: "POST",
	dataType: 'json',
	cache: false,
	data: projectData,
	 	success: function(response) {
	        if(response.status == 'fail') {
	        	removeLoader();
	        	$('#finishProjectResponse').html(response.message);
	        }
	        else if(response.status == 'success') {	        	
	        	//var url = '/add_quote/step4';
	        	//$.redirect(url,{ projectId: response.projectId, projectPrice: response.projectPrice });
				window.location.href = `/?p=${response.projectId}`;
						//console.log(response.log);
	        }

	 	},
	error: function(response) {
	        removeLoader();
	        $('#finishProjectResponse').html("<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>Something went wrong! Unknown error!</div>");
  		}
  	});
}

function inputAdd(value) {
	var current = $('input#' + value).val();
	current = parseInt(current);
	newValue = current+1;
	$('input#' + value).val(newValue);
}

function inputRemove(value) {
	var current = $('input#' + value).val();
	current = parseInt(current);
	newValue = current-1;
	if(newValue < 1) {
		newValue = 1;
	}
	$('input#' + value).val(newValue);
}

function startTemplate(templateId) {
	alert(templateId);
}

//Manage CustomQuoteField Repeater in step2
$('.populateCustomQuoteField').click(function(){
	const newRow = $('.customQuoteFieldContainer').data('rows')+1;
	
	$clone = $('.customQuoteFieldRow').first().clone();
	
	$clone.find('.has-error').removeClass('has-error');
	
	$clone.find('input[type="number"]').attr('placeholder', '0.00');
	$clone.find('input').val('');
	$clone.find('textarea').val('');
	$clone.find('.deleteCustomQuoteField').css('display', 'inline-block');
	
	$('.customQuoteFieldContainer').append($clone);
	$('.customQuoteFieldContainer').data('rows',newRow);
});
$('.customQuoteFieldContainer').on('click','.deleteCustomQuoteField',function(){
	const rows = $('.customQuoteFieldContainer').data('rows');	
	$('.customQuoteFieldContainer').data('rows',rows - 1);
	
	$(this).closest('.row').remove();
	
	customQuoteFieldsValidation();
});

$('.customQuoteFieldContainer').on('change', 'input, textarea', (e) => {
	customQuoteFieldsValidation();
});



let customQuoteFieldsValidation = () => {
	$('.gotoStep3').removeClass('disabled');
	
	$.each($('.customQuoteFieldRow'), (index, row) => {
		if( !customQuoteRowValidation( $(row) ) && !$('.gotoStep3').hasClass('disabled') ) 
			$('.gotoStep3').addClass('disabled');
	});
}

let customQuoteRowValidation = (row) => {
	const fields = row.find('input, textarea');
	
	let count = 0;
	$.each(fields, (index, el) => {
		if($(el).val()) {
			$(el).closest('div').removeClass('has-error')
			count++;
		}
		else $(el).closest('div').addClass('has-error');
	});
	
	if(count % fields.length == 0){
		fields.closest('div').removeClass('has-error');
		return true;
	}
	
	return false;
}