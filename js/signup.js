const form = document.getElementById("signupForm");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    if(fullname===""){

        alert("Please enter your full name.");
        return;
    }

    const emailPattern=/^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if(!email.match(emailPattern)){

        alert("Enter a valid email address.");
        return;
    }

    if(password.length<6){

        alert("Password must contain at least 6 characters.");
        return;
    }

    if(password!==confirmPassword){

        alert("Passwords do not match.");
        return;
    }

    if(!terms){

        alert("Please accept Terms & Conditions.");
        return;
    }

    alert("Validation Successful!");

});