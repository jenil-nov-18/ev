$(function(){
	$("#wizard").steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "fade",
        enableAllSteps: true,
        transitionEffectSpeed: 500,
        onStepChanging: function (event, currentIndex, newIndex) { 
            if ( newIndex === 1 ) {
                $('.steps ul').addClass('step-2');
            } else {
                $('.steps ul').removeClass('step-2');
            }
            if ( newIndex === 2 ) {
                $('.steps ul').addClass('step-3');
            } else {
                $('.steps ul').removeClass('step-3');
            }

            if ( newIndex === 3 ) {
                $('.steps ul').addClass('step-4');
                $('.actions ul').addClass('step-last');
            } else {
                $('.steps ul').removeClass('step-4');
                $('.actions ul').removeClass('step-last');
            }
            return true; 
        },
        labels: {
            finish: "Let In Touch ",
            next: "Next",
            previous: "Previous"
        },
        onFinished: function(event, currentIndex){
            var form = document.getElementById('signupForm');
            if(form){
                var ev = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(ev);
            }
        }
    });
    
    // When the wizard finishes, dispatch a submit event on the signup form
    // so that pages which attach a submit handler to the form (signup.html)
    // will run their client-side registration logic.
    var wizard = document.getElementById('wizard');
    if(wizard && typeof window.CustomEvent !== 'undefined'){
        // The plugin triggers its own onFinished; we also listen for the finish button click
        // but the safest is to add a delegated listener for the wizard actions area.
        var actions = document.querySelector('.actions');
        if(actions){
            actions.addEventListener('click', function(e){
                var target = e.target;
                // the finish button is typically an <a> inside .actions with data-role 'finish'
                if(target && (target.textContent.trim().toLowerCase() === 'let in touch' || target.getAttribute('href') === '#finish')){
                    var form = document.getElementById('signupForm');
                    if(form){
                        // create and dispatch a submit event so handlers run
                        var ev = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(ev);
                    }
                }
            }, false);
        }
    }
    // Custom Steps Jquery Steps
    $('.wizard > .steps li a').click(function(){
    	$(this).parent().addClass('checked');
		$(this).parent().prevAll().addClass('checked');
		$(this).parent().nextAll().removeClass('checked');
    });
    // Custom Button Jquery Steps
    $('.forward').click(function(){
    	$("#wizard").steps('next');
    })
    $('.backward').click(function(){
        $("#wizard").steps('previous');
    })
    // Checkbox
    $('.checkbox-circle label').click(function(){
        $('.checkbox-circle label').removeClass('active');
        $(this).addClass('active');
    })
})


