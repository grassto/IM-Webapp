# cordova-plugin-keyboard

Since [ionic-plugin-keyboard](https://github.com/driftyco/ionic-plugin-keyboard) doesn't provide `keyboardDidShow` and `keyboardDidHide` events for android, and [cordova-plugin-keyboard](https://github.com/cjpearson/cordova-plugin-keyboard) doesn't support __KeyboardShrinksView__ preference for ios, I combined these two plugins and make this new plugin.


> This plugin provides the `Keyboard` object which has some functions to customize and control the keyboard. It also supports the __HideKeyboardFormAccessoryBar__ (boolean) and __KeyboardShrinksView__ (boolean) preferences for ios in config.xml.



This plugin was based on this Apache [project](https://github.com/apache/cordova-plugins/tree/master/keyboard) and has a compatible API.

- [Installation](#installation)
- [Methods](#methods)
 - [Keyboard.shrinkView](#keyboardshrinkview)
 - [Keyboard.hideFormAccessoryBar](#keyboardhideformaccessorybar)
 - [Keyboard.disableScrollingInShrinkView](#keyboarddisablescrollinginshrinkview)
 - [Keyboard.hide](#keyboardhide)
 - [Keyboard.show](#keyboardshow)
- [Properties](#properties)
 - [Keyboard.isVisible](#keyboardisvisible)
 - [Keyboard.automaticScrollToTopOnHiding](#keyboardautomaticscrolltotoponhiding)
- [Events](#events)
 - [keyboardDidShow](#keyboarddidshow)
 - [keyboardDidHide](#keyboarddidhide)
 - [keyboardWillShow](#keyboardwillshow)
 - [keyboardWillHide](#keyboardwillhide)
 - [keyboardHeightWillChange](#keyboardheightwillchange)
- [Releases](#releases) 

# Installation

From github latest (may not be stable)

`cordova plugin add https://github.com/lovelyelfpop/cordova-plugin-keyboard`

# Methods

## Keyboard.shrinkView

Shrink the WebView when the keyboard comes up.

    Keyboard.shrinkView(true);

#### Description

Set to true to shrink the WebView when the keyboard comes up. The WebView shrinks instead of the viewport shrinking and the page scrollable. This applies to apps that position their elements relative to the bottom of the WebView. This is the default behaviour on Android, and makes a lot of sense when building apps as opposed to webpages.


#### Supported Platforms

- iOS

#### Quick Example

    Keyboard.shrinkView(true);
    Keyboard.shrinkView(false);

## Keyboard.hideFormAccessoryBar

Hide the keyboard toolbar.

    Keyboard.hideFormAccessoryBar(true);

#### Description

Set to true to hide the additional toolbar that is on top of the keyboard. This toolbar features the Prev, Next, and Done buttons.


#### Supported Platforms

- iOS

#### Quick Example

    Keyboard.hideFormAccessoryBar(true);
    Keyboard.hideFormAccessoryBar(false);


## Keyboard.disableScrollingInShrinkView

Disable scrolling when the the WebView is shrunk.

    Keyboard.disableScrollingInShrinkView(true);

#### Description

Set to true to disable scrolling when the WebView is shrunk.


#### Supported Platforms

- iOS

#### Quick Example

    Keyboard.disableScrollingInShrinkView(true);
    Keyboard.disableScrollingInShrinkView(false);
 
## Keyboard.hide

Hide the keyboard

    Keyboard.hide();

#### Description

Call this method to hide the keyboard

#### Supported Platforms

- iOS
- Android

#### Quick Example

    Keyboard.hide();

## Keyboard.show

Show the keyboard

    Keyboard.show();

#### Description

Call this method to show the keyboard.

This method only support android. 

For ios, if you want the keyboard to appear when calling `focus()` on form inputs, you should set `KeyboardDisplayRequiresUserAction` to `false` on `config.xml`.


#### Supported Platforms

- Android

#### Quick Example

    Keyboard.show();

# Properties

## Keyboard.isVisible

Determine if the keyboard is visible.

    if (Keyboard.isVisible) {
        // do something
    }

#### Description

Read this property to determine if the keyboard is visible.


#### Supported Platforms

- iOS
- Android

## Keyboard.automaticScrollToTopOnHiding

Specifies whenether content of page would be automatically scrolled to the top of the page
when keyboard is hiding.

    Keyboard.automaticScrollToTopOnHiding = true;

#### Description

Set this to true if you need that page scroll to beginning when keyboard is hiding.
This is allows to fix issue with elements declared with position: fixed,
after keyboard is hiding.


#### Supported Platforms

- iOS

# Events

## keyboardDidShow

This event is fired when keyboard fully shown.

	//for ios
    window.addEventListener('keyboardDidShow', function () {
        // Describe your logic which will be run each time keyboard is shown.
    });

	//for android
    window.addEventListener('keyboardDidShow', function (event) {
        // Describe your logic which will be run each time keyboard is shown.
		console.log(event.keyboardHeight);
    });

#### Description

Attach handler to this event to be able to receive notification when keyboard is shown.


#### Supported Platforms

- iOS
- Android

## keyboardDidHide

This event is fired when the keyboard is fully closed.

    window.addEventListener('keyboardDidHide', function () {
        // Describe your logic which will be run each time keyboard is closed.
    });

#### Description

Attach handler to this event to be able to receive notification when keyboard is closed.


#### Supported Platforms

- iOS
- Android

## keyboardWillShow

This event fires before keyboard will be shown.

    window.addEventListener('keyboardWillShow', function () {
        // Describe your logic which will be run each time when keyboard is about to be shown.
    });

#### Description

Attach handler to this event to be able to receive notification when keyboard is about to be shown on the screen.


#### Supported Platforms

- iOS

## keyboardWillHide

This event is fired when the keyboard is fully closed.

    window.addEventListener('keyboardWillHide', function () {
        // Describe your logic which will be run each time when keyboard is about to be closed.
    });

#### Description

Attach handler to this event to be able to receive notification when keyboard is about to be closed.


#### Supported Platforms

- iOS

## keyboardHeightWillChange

This event is fired when the keyboard is fully closed.

    window.addEventListener('keyboardHeightWillChange', function (event) {
        // Describe your logic which will be run each time when keyboard is about to be closed.
        console.log(event.keyboardHeight);
    });

#### Description

Attach handler to this event to be able to receive notification when keyboard is about to be closed.


#### Supported Platforms

- iOS
