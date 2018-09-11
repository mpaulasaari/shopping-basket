/**
 * Global variables
 */

var fbDatabaseURL =  '' // Change to https://XXXX.firebaseio.com/
    fb =             new Firebase(fbDatabaseURL), // Firebase database reference
    hash =           window.location.hash,
    listName =       hash ? hash.slice(1) : 'null',
    list =           fb.child(listName),
    listItems =      list.child('items'),
    listPriority =   0, // listPriority is for sorting the lists by priority
    itemPriority =   0, // itemPriority is used for sorting the items by priority
    itemSlideSpeed = 100,
    keys =           { ENTER: 13, ESC: 27 };


/**
 * List singleton contains variables and functions for manipulating the lists
 * @method
 * @return {Object}
 */

var List = (function() {


  var _listAction = ''; // Declare list action (local variable). This is used to track which list action is active


  /**
   * Reset list action
   * @method      _resetListAction
   * @param       {Object}         _container
   * @constructor
   */

  function _resetListAction(_container) {

    _listAction = '';

    if (_container) {

      _container.removeClass('adding editing deleting');

    }

  }


  /**
   * Get item names
   * @method getItemNames
   * @return {Array}
   */

  function getItemNames() {

    var _listItemNames = [];

    listItems.on('value', function(e) {

      e.forEach(function(f) {

        _listItemNames.push(f.child('name').val());

      });

    });


    return _listItemNames;

  }


  /**
   * Get current list name
   * @method getListName
   * @return {String}
   */

  function getListName() {

    list.once('value', function(e) {

      _listName = e.child('name').val();

    });

    return _listName;

  }


  /**
   * Get current list action
   * @method getListAction
   * @return {String}
   */

  function getListAction() {

    return _listAction;

  }


  /**
   * Add list
   * @method addList
   */

  function addList() {

    var _container = $('#header'),
        _input =     _container.find('input');

    _listAction = 'add-list';

    _container.addClass('adding');

    _input.focus().val('').attr('value', ''); // Set focus to the list editor input reset it's value

  }


  /**
   * Edit list
   * @method editList
   */

  function editList() {

    var _container = $('#header'),
        _input =     _container.find('input'),
        _listName =  getListName();

    _listAction = 'edit-list';

    _container.addClass('editing');

    _input
      .val('')
      .focus()
      .val(_listName)
      .attr('value', _listName); // Set focus to the list editor input and set it's value to the list's name

  }


  /**
   * Remove list
   * @method removeList
   */

  function removeList() {

    var _container = $('#header'),
        _input =     _container.find('input'),
        _listName =  getListName();

    _listAction = 'delete-list';

    _container.addClass('deleting');

    _input.val('Delete ' + _listName + '?'); // Use the list editor's input to show a confirmation

  }


  /**
   * Confirm list action
   * @method confirmList
   */

  function confirmList() {

    var _container = $('#header'),
        _input =     _container.find('input'),
        _value =     _input.val().toUpperCase();

    if (_listAction === 'add-list') {

      fb.push({

        name: _value

      }).setPriority(listPriority++); // Push new list to Firebase and give it the highest priority

    } else if (_listAction === 'edit-list') {

      list.update({

        name: _value

      }); // Update list name in Firebase

    } else if (_listAction === 'delete-list') {

      list.remove(); // Remove list from Firebase

    }

    _resetListAction(_container); // Reset list action

  }


  /**
   * Cancel list action
   * @method cancelList
   */

  function cancelList() {

    var _container = $('#header');

    _resetListAction(_container); // Reset list action

  }


  return {

    getItemNames:  getItemNames,
    getListName:   getListName,
    getListAction: getListAction,
    addList:       addList,
    editList:      editList,
    removeList:    removeList,
    confirmList:   confirmList,
    cancelList:    cancelList

  }

})();


/**
 * Item Singleton contains variables and functions for manipulating the items
 * @method
 * @return {Object}
 */

var Item = (function() {


  var _itemAction = ''; // Declare item action (local variable). This is used to track which item action is active


  /**
   * Get item status
   * @method _getItemStatus
   * @param  {String}       _key
   * @return {String}
   */

  function _getItemStatus(_key) {

    var _itemRef = listItems.child(_key);

    _itemRef.once('value', function(e) {

      _status = e.child('status').val();

    });

    return _status;

  }


  /**
   * Get current item action
   * @method getItemAction
   * @return {String}
   */

  function getItemAction() {

    return _itemAction;

  }


  /**
   * Reset item actions
   * @method resetItemAction
   * @param  {String}        _container
   */

  function resetItemAction(_container) {

    _itemAction = '';

    if (_container) {

      _container.removeClass('adding editing deleting');

    }

  }


  /**
   * Edit item
   * @method editItem
   */

  function editItem() {

    if (_itemAction === '') { // Allow editing only if no item action is unfinished

      var _container = $(this).closest('.item'),
          _input =     _container.find('input'),
          _key =       _container.attr('id'),
          _itemRef =   listItems.child(_key),
          _status =    _getItemStatus(_key);

      if (_status === 'undone') { // Allow editing of undone items only

          _itemAction = 'edit-item';

          _container.addClass('editing');

          _input.removeAttr('readonly').blur().focus();

      }

    }

  }


  /**
   * Add item
   * @method addItem
   */

  function addItem() {

    if (_itemAction === '') { // Allow adding only if no item action is unfinished

      _itemAction = 'add-item';

      listItems.push({

        name:   '',
        status: 'undone'

      }).setPriority(itemPriority++); // Push new item without a name to Firebase

    }

  }


  /**
   * Remove item action
   * @method removeItem
   */

  function removeItem() {

    if (_itemAction === '') { // Allow removing only if no item action is unfinished

      var _container = $(this).closest('.item'),
          _input =     _container.find('input'),
          _key =       _container.attr('id');

      _itemAction = 'delete-item';

      _container.addClass('deleting');

      _input.val('Delete ' + _input.val() + '?'); // Use the item's input to show a confirmation

    }

  }


  /**
   * Confirm item action
   * @method confirmItem
   * @param  {Object}    $el
   */

  function confirmItem($el) {

    var _el =        $el.length ? $el : $(this),
        _container = _el.closest('.item'),
        _input =     _container.find('input'),
        _key =       _container.attr('id'),
        _itemRef =   listItems.child(_key);

    if (_itemAction === 'add-item' || _itemAction === 'edit-item') {

      _itemRef.update({

        name: _input.val()

      }); // Update item value in Firebase. Same function for adding and editing since adding an item creates a blank item which is set straight to edit mode

    } else if (_itemAction === 'delete-item') {

      _itemRef.remove(); // Remove item from Firebase

    }

    _input.attr('readonly', 'readonly'); // Make the item uneditable

    resetItemAction(_container); // Reset item action

  }


  /**
   * Cancel item action
   * @method cancelItem
   * @param  {Object}   $el
   */

  function cancelItem($el) {

    var _el =        $el.length ? $el : $(this),
        _container = _el.closest('.item'),
        _input =     _container.find('input'),
        _value =     _input.attr('value'),
        _key =       _container.attr('id');

    if (_itemAction === 'add-item') {

      listItems.child(_key).remove(); // Remove newly created blank item from Firebase

    }

    _input.val(_value).attr('readonly', 'readonly'); // Reset item's value and make it uneditable

    resetItemAction(_container); // Reset item action

  }


  /**
   * Change item status
   * @method changeItemStatus
   */

  function changeItemStatus() {

    var _container =     $(this).closest('.item'),
        _key =           _container.attr('id'),
        _itemRef =       listItems.child(_key),
        _currentStatus = _getItemStatus(_key),
        _newStatus =     _currentStatus === 'undone' ? 'done' : 'undone',
        _styledStatus =  _newStatus.charAt(0).toUpperCase() + _newStatus.slice(1);

    _itemRef.update({

      status: _newStatus

    }); // Update item's status in Firebase

    if (_newStatus === 'done') {

      _itemRef.setPriority(itemPriority++);

      _container.insertAfter(_container.siblings(":last")); // Move item to end of list

    }

    $(this).attr('title', _styledStatus); // Set new status as tooltip

    _container.removeClass(_currentStatus).addClass(_newStatus); // Give item a class to match it's status

  }


  return {

    getItemAction:    getItemAction,
    resetItemAction:  resetItemAction,
    addItem:          addItem,
    editItem:         editItem,
    removeItem:       removeItem,
    confirmItem:      confirmItem,
    cancelItem:       cancelItem,
    changeItemStatus: changeItemStatus

  }

})();


/**
 * Document ready
 * @method
 */

$(function() {


  /**
   * Cache DOM elements
   */

  var $header =        $('#header'),
      $items =         $('#items'),
      $itemList =      $('#item-list'),
      $itemDiv =       $('#item'),
      $listSelect =    $('#lists'),
      $listOption =    $('#option'),
      $listMenu =      $('#list-menu'),
      $listMenuItems = $('#list-menu-items'),
      $shareListLink = $('#share-list');


  /**
   * Firebase events
   */

  /**
   * Load lists
   * @method initLists
   */

  function initLists() {

    $listOption.remove(); // Remove option placeholder from DOM


    /**
     * Load latest list if no valid hash/ID provided
     */

    fb.orderByPriority().once('value', function(e) {

      if (!e.child(listName).exists()) { // Check if list is found with current hash/listName

        e.forEach(function(f) { // Loop through existing lists

          _key =   f.key(); // This will get the key of latest (highest priority) list, so that it'll be loaded by default
          _value = f.val().name;

        });

        if (_key && _value) {

          listName = _key;

          list = fb.child(listName); // Reference to the default list

          $listSelect.val(_value).change(); // Set list selector show the default

        } else {

          console.log('No lists found');
          return;

        }

      } else {

        setShareLink(); // Set initial share list url

      }


      $('body').removeClass('loading').addClass('ready'); // Remove loading class from body


    }, function (errorObject) {
      console.log('Value read failed: ' + errorObject.code);
    });

  }


  /**
   * Listener for list adds
   * @method
   * @param  {Object} e
   */

  fb.orderByPriority().on('child_added', function(e) {

    var _key =           e.key()
        _value =         e.val().name,
        _selected =      (_key === listName ? true : false),
        $newListOption = $listOption.clone(); // Use the option placeholder as a template for list options

    $newListOption // Set correct values for the list option
      .attr({
        'id':    _key,
        'value': _value,
      })
      .prop('selected', _selected)
      .text(_value);

    $listSelect.append($newListOption); // Append new list to list select

    fb.child(_key).setPriority(listPriority++); // Give new list the highest priority

    if (List.getListAction() === 'add-list') {

      $listSelect.val(_value).change(); // Set list selector to show the new list if it was created by the user

    }

  }, function (errorObject) {
    console.log('Item added error: ' + errorObject.code);
  });


  /**
   * Listener for list changes
   * @method
   * @param  {Object} e
   */

  fb.on('child_changed', function(e) {

    var _value = e.val().name;

    $('#' + e.key()).attr('value', _value).text(_value); // Set new name for the changed list in list select

  }, function (errorObject) {
    console.log('Item changed error: ' + errorObject.code);
  });


  /**
   * Listener for list removes
   * @method
   * @param  {Object} e
   */

  fb.on('child_removed', function(e) {

    listPriority--;

    $('#' + e.key()).remove(); // Remove list element from DOM

    if (List.getListAction() === 'delete-list') { // Check if the list was deleted by the current user

      listName = 'null'; // Reset listName

      initLists(); // Re-init lists to load the default list

    }

  }, function (errorObject) {
    console.log('Item removed error: ' + errorObject.code);
  });


  /**
   * Load items
   * @method initItems
   */

  function initItems() {

    $itemList.find('.item').remove(); // Remove all previous item elements from DOM


    /**
     * Listener for item adds
     * @method
     * @param  {Object} e
     */

    listItems.orderByPriority().on('child_added', function(e) {

      var key =         e.key(),
          status =      e.val().status,
          title =       status.charAt(0).toUpperCase() + status.slice(1),
          $newItemDiv = $itemDiv.clone(); // Use the item placeholder as a template for items

      $newItemDiv // Set correct values for the item
        .addClass(status)
        .attr('id', key)
        .find('.status')
          .attr('title', title)
        .end()
        .find('input')
          .attr('value', e.val().name);

      $itemList.append($newItemDiv); // Append new item to items div

      list.child('items/' + key).setPriority(itemPriority++);

      if (Item.getItemAction() === 'add-item') { // Check if the new item was created by the user

        $newItemDiv // Make the new item editable, animate it's reveal and set focus on it
          .hide()
          .slideDown(itemSlideSpeed)
          .addClass('editing')
          .find('input')
            .removeAttr('readonly')
            .focus();

      }

    }, function (errorObject) {
      console.log('Item added error: ' + errorObject.code);
    });


    /**
     * Listener for item changes
     * @method
     * @param  {Object} e
     */

    listItems.on('child_changed', function(e) {

      var _status = e.val().status,
          _title =  status.charAt(0).toUpperCase() + status.slice(1);

      $('#' + e.key())
        .removeClass('done undone')
        .addClass(_status)
        .find('.status')
          .attr('title', _title)
        .end()
        .find('input')
          .attr('value', e.val().name);

    }, function (errorObject) {
      console.log('Item changed error: ' + errorObject.code);
    });


    /**
     * Listener for item removes
     * @method
     * @param  {Object} e
     */

    listItems.on('child_removed', function(e) {

      itemPriority--;

      $('#' + e.key()).slideUp(itemSlideSpeed, function() { // Animate the deleted item's hidings

        $(this).remove(); // Remove the deleted item from DOM

      });

    }, function (errorObject) {
      console.log('Item removed error: ' + errorObject.code);
    });

  }


  /**
   * Set correct url to share list button / compose email content for sending
   * @method setShareLink
   * @param  {String}     _key
   */

  function setShareLink(_key) {

    var _key =             _key === undefined ? window.location.hash.slice(1) : _key,
        _url =             'http://' + window.location.hostname + window.location.pathname + '#' + _key,
        _listName =        List.getListName(),
        _styledListName =  _listName.charAt(0).toUpperCase() + _listName.slice(1),
        _listItems =       List.getItemNames();
        _styledListItems = '';

    for (var i = 0; i < _listItems.length; i++) {

      _styledListItems +=  '\n - ' + _listItems[i];

    }

    var _emailContent = {

      subject: encodeURIComponent('Shared Bsk list: ' + _styledListName),
      header:  encodeURIComponent('Here\'s my Bsk list I want to share with you. \n\n'),
      title:   encodeURIComponent(_styledListName + ':'),
      content: encodeURIComponent(_styledListItems),
      footer:  encodeURIComponent('\n\n Click the link below or copy it to your browser to open the list: \n'),
      url:     _url

    };

    $shareListLink.attr(
      'href', 'mailto:?subject=' + _emailContent.subject +
      '&body=' + _emailContent.header +
      _emailContent.title +
      _emailContent.content +
      _emailContent.footer +
      _emailContent.url
    );

  }


  /**
   * Initialize lists and items
   */

  initLists();

  initItems();


  /**
   * Make items sortable
   */

  $itemList.sortable({

    handle: '.sort',
    axis:   'y',
    update: function(e, ui) {

      itemPriority = 0; // Reset the item priorities

      $(this).find('.item').each(function() {

        var _id = $(this).attr('id');

        listItems.child(_id).setPriority(itemPriority++); // Set new priorities for the items according to their new order

      });

    }

  });


  /**
   * List action bindings
   */

  $header

    .on('click', '#new-list', List.addList)

    .on('click', '#edit-list', List.editList)

    .on('click', '#delete-list', List.removeList)

    .on('click', '.confirm', List.confirmList)

    .on('click', '.cancel', List.cancelList)

    .on('keypress', 'input', function(e) { // Set bindings to 'Enter' and 'Esc' keys on list editor

      var _keyCode = e.keyCode;

      if (_keyCode === keys.ESC || _keyCode === keys.ENTER) {

        if (_keyCode === keys.ESC) {

          List.cancelList(); // 'Esc' is cancel

        } else if (_keyCode === keys.ENTER) {

          List.confirmList(); // 'Enter' is confirm

        }

        $(this).blur(); // Remove focus from the input

      }

    });


  /**
   * Item action bindings
   */

  $items

    .on('click', '#new-item', Item.addItem)

    .on('click', '.status', Item.changeItemStatus)

    .on('click', 'input', Item.editItem)

    .on('click', '.delete', Item.removeItem)

    .on('click', '.confirm', Item.confirmItem)

    .on('click', '.cancel', Item.cancelItem)

    .on('keypress', 'input', function(e) { // Set bindings to 'Enter' and 'Esc' keys on item editor

      var _keyCode = e.keyCode;

      if (_keyCode === keys.ESC || _keyCode === keys.ENTER) {

        var $el = $(this);

        if (_keyCode === keys.ESC) {

          Item.cancelItem( $el ); // 'Esc' is cancel

        } else if (_keyCode === keys.ENTER) {

          Item.confirmItem( $el ); // 'Enter' is confirm

        }

        $el.blur(); // Remove focus from the input

      }

    });


  /**
   * List change listener
   */

  $listSelect.on('change', function() {

    listItems.off(); // Detach previous callbacks from current list

    var _key = $(this).find(':selected').attr('id'); // Get the new list key/ID

    window.location.hash = _key;

    list = fb.child(_key);

    listItems = list.child('items');

    setShareLink(_key);

    Item.resetItemAction(); // Changing the list cancels any unfinished item actions

    initItems(); // Re-init items to show items for the new list

  });


  /**
   * List menu bindings
   */

  $listMenu.on('click', '#open-list-menu', function() {

    $listMenuItems.toggle();

  });


  $listMenuItems.on('click', 'a', function() {

    $listMenuItems.hide();

  });

});
