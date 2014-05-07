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

  $('#resetSettings').click(function(ev) {
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
    $(modal).find('#confirmResetAccept').click(function() {
      //this is clicked after modal is displayed, so all it should do is reset
      if (!resetUserSettings()) {
        console.log('reset failed');
      } else {
        console.log('reset successful');
        //update UI with new settings
        restoreUserSettings();
        //disable Save & discard changes if they were active
        $('#saveSettings').attr('disabled', true);
        $('#discardSettings').attr('disabled', true);
      }
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
  $('#discardSettings').click(function() {
    //user's settings should be restored from chrome storage
    restoreUserSettings();

    //Save & Discard changes buttons should be disabled
    $('#saveSettings').attr('disabled', true);
    $('#discardSettings').attr('disabled', true);
  });

  //handler for Save button on Settings page
  $('#saveSettings').click(function() {
    //if save button is clicked, then save the settings :-)
    //fetch everything that needs to be saved
    var userSettings = {};
    //click expand-url settings
    var expand_url_action = $('input[type="radio"]:checked').val();

    userSettings.open_expanded_url_action = expand_url_action;
    //now save
    if (!saveUserSettings(userSettings)) {
      return;
    }
    //save was ok, disable Save & Discard Changes buttons
    $('#saveSettings').attr('disabled', true);
    $('#discardSettings').attr('disabled', true);
  });


  //this function should be run every time page is loaded to ensure all settings
  //are in sync
  restoreUserSettings();
});

function resetUserSettings() {
  console.log('about to reset default user settings')
  //put default values for all settings
  var userSettings = {
    "open_expanded_url_action": Config.default_expand_url_action
  };
  chrome.storage.sync.set(userSettings);
  if (chrome.runtime.lastError !== undefined) {
    //throw an error
    console.error(
      'an error occurred while resetting settings in chrome storage: ' +
      chrome.runtime.lastError);
    //show error message
    return false;
  } else {
    //show success message
    return true;
  }
}

/**
 * function to save user settings to chrome storage
 */
function saveUserSettings(data) {
  chrome.storage.sync.set(data);
  if (chrome.runtime.lastError !== undefined) {
    //throw an error
    console.error('an error occurred while saving to chrome storage: ' +
      chrome.runtime.lastError);
    //show error message
    return false;
  } else {
    //show success message
    return true;
  }
}

/**
 * function to restore user changes to the last previously changed ones
 */
function restoreUserSettings() {
  chrome.storage.sync.get('open_expanded_url_action',
    function(data) {
      if (chrome.runtime.lastError !== undefined) {
        //throw an error
        console.error('an error occurred while fetching chrome storage data: ' +
          chrome.runtime.lastError);
        return;
      }
      if (data.open_expanded_url_action === undefined) {
        //should be updated with default settings
        data.open_expanded_url_action = Config.default_expand_url_action;
      }
      if (!updateSettingsUI(data)) {
        console.error('an error occurred while updating settings UI');
        return;
      }
      //show success message to user
      console.log('settings reset OK')
    });
}

/**
 * function that updates the settings UI based on data from chrome storage
 */
function updateSettingsUI(data) {
  $.each(data, function(k, v) {
    console.log(k + ":" + v);
    if (k === 'open_expanded_url_action') {
      //radio buttons should be updated
      var $openExpandedUrlRadios = $('input[name="openExpandedUrlOptions"]');
      $openExpandedUrlRadios.filter('[value=' + v + ']').prop('checked', true);
    }
  });
  return true;
}
