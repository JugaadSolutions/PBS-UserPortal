/*
 jQuery document ready.
 */
$(document).ready(function()
{
	
    /*
     assigning keyup event to password field
     so everytime user type code will execute
     */

    $('#password').keyup(function()
    {

        $('#confirmPassword').val('');

	$('#confirmPasswordresult').html(' ');
        $('#result').html(checkStrength($('#password').val()));
        if(checkStrength($('#password').val()) == "Valid"  && confirmpassword($('#confirmPassword').val())== '')
        {

            $("#btnSubmit").prop("disabled",false);
        }
        else
        {

            $("#btnSubmit").prop("disabled",true);
        }
    })

    $('#confirmPassword').keyup(function()
    {

        $('#confirmPasswordresult').html(confirmpassword($('#confirmPassword').val()));

        if(checkStrength($('#password').val()) == "Valid"  && confirmpassword($('#confirmPassword').val())== '')
        {

            $("#btnSubmit").prop("disabled",false);
        }
        else
        {

            $("#btnSubmit").prop("disabled",true);
        }
    })




});

function confirmpassword(confirmPassword)
{
    var btn = $('#btnSubmit');

    var password = $('#password').val();
    var passwordStrength = checkStrength($('#password').val());
    if((password == confirmPassword) )
    {

        return '';
    }
    else
    {
        return 'Password Missmatch'
    }
}

/*
 checkStrength is function which will do the
 main password strength checking for us
 */

function checkStrength(password)
{
	//initial strength
	var strength = 0;


	if (password.length >= 6) 
	{

		//if password contains both lower and uppercase characters, increase strength value
		if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  
		{
			//if it has numbers and characters, increase strength value
			if (password.match(/([0-9])/)) 
			{
				//if it has one special character, increase strength value
				if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))  
				{
					strength = 1;
				}
			}
		}
	}
	if( strength == 1 )
	{
		//$('#result').removeClass();
		//$('#result').addClass('Valid');
		return 'Valid';
	}
	else 
	{
		//$('#result').removeClass();
		//$('#result').addClass('Invalid');
		return 'Invalid';
	}
}
