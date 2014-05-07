/**
 * js functions to control stuff on options page
 */

/**
 * handler for some default content that needs to be loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  $('.menu a').click(function(ev) {
    ev.preventDefault();
    var selected = 'selected';

    $('.mainview > *').removeClass(selected);
    $('.menu li').removeClass(selected);
    setTimeout(function() {
      $('.mainview > *:not(.selected)').css('display', 'none');
    }, 100);

    $(ev.currentTarget).parent().addClass(selected);
    var currentView = $($(ev.currentTarget).attr('href'));
    currentView.css('display', 'block');
    setTimeout(function() {
      currentView.addClass(selected);
    }, 0);

    setTimeout(function() {
      $('body')[0].scrollTop = 0;
    }, 200);
  });

  $('#launch_modal').click(function(ev) {
    ev.preventDefault();
    var modal = $('.overlay').clone();
    $(modal).removeAttr('style');
    $(modal).find('button, .close-button').click(function() {
      $(modal).addClass('transparent');
      setTimeout(function() {
        $(modal).remove();
      }, 1000);
    });

    $(modal).click(function() {
      $(modal).find('.page').addClass('pulse');
      $(modal).find('.page').on('webkitAnimationEnd',
        function() {
          $(this).removeClass('pulse');
        });
    });
    $(modal).find('.page').click(function(ev) {
      ev.stopPropagation();
    });
    $('body').append(modal);
  });

  $('.mainview > *:not(.selected)').css('display', 'none');

  //handler for changes done to openExpandedUrlOptions radio buttons
  $('input[name="openExpandedUrlOptions"]').change(function() {
    //Save & discard changes buttons should be enabled
    $('#saveSettings').removeAttr('disabled');
    $('#discardSettings').removeAttr('disabled');
  });

  //handler for discardSettings button on Settings page
  $('#discardSettings').click(function(){
    //Save & Discard changes buttons should be disabled
    $('#saveSettings').attr('disabled', true);
    $('#discardSettings').attr('disabled', true);

    //user's settings should be restored from chrome storage
    chrome.storage.sync.get('open_expanded_url_actionopen_expanded_url_action', updateSettingsUI);
  });
});

/**
* function that updates the settings UI based on data from chrome storage
*/
function updateSettingsUI(data){
  
}
