/*!
 * Viewer.js v1.0.0
 * https://github.com/fengyuanchen/viewerjs
 *
 * Copyright (c) 2015-2018 Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2018-05-09T06:09:22.503Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Viewer = factory());
}(this, (function () { 'use strict';

  var DEFAULTS = {
    // Enable inline mode
    inline: false,

    // Show the button on the top-right of the viewer
    button: true,

    // Show the navbar
    navbar: true,

    // Show the title
    title: true,

    // Show the toolbar
    toolbar: true,

    // Show the tooltip with image ratio (percentage) when zoom in or zoom out
    tooltip: true,

    // Enable to move the image
    movable: true,

    // Enable to zoom the image
    zoomable: true,

    // Enable to rotate the image
    rotatable: true,

    // Enable to scale the image
    scalable: true,

    // Enable CSS3 Transition for some special elements
    transition: true,

    // Enable to request fullscreen when play
    fullscreen: true,

    // The amount of time to delay between automatically cycling an image when playing.
    interval: 5000,

    // Enable keyboard support
    keyboard: true,

    // Enable a modal backdrop, specify `static` for a backdrop which doesn't close the modal on click
    backdrop: true,

    // Indicate if show a loading spinner when load image or not.
    loading: true,

    // Indicate if enable loop viewing or not.
    loop: true,

    // Min width of the viewer in inline mode
    minWidth: 200,

    // Min height of the viewer in inline mode
    minHeight: 100,

    // Define the ratio when zoom the image by wheeling mouse
    zoomRatio: 0.1,

    // Define the min ratio of the image when zoom out
    minZoomRatio: 0.01,

    // Define the max ratio of the image when zoom in
    maxZoomRatio: 100,

    // Define the CSS `z-index` value of viewer in modal mode.
    zIndex: 2015,

    // Define the CSS `z-index` value of viewer in inline mode.
    zIndexInline: 0,

    // Define where to get the original image URL for viewing
    // Type: String (an image attribute) or Function (should return an image URL)
    url: 'src',

    // Define where to put the viewer in modal mode.
    // Type: String | Element
    container: 'body',

    // Filter the images for viewing.
    // Type: Function (return true if the image is viewable)
    filter: null,

    // Event shortcuts
    ready: null,
    show: null,
    shown: null,
    hide: null,
    hidden: null,
    view: null,
    viewed: null
  };

  var TEMPLATE = '<div class="viewer-container" touch-action="none">' + '<div class="viewer-canvas"></div>' + '<div class="viewer-footer">' + '<div class="viewer-title"></div>' + '<div class="viewer-toolbar"></div>' + '<div class="viewer-navbar">' + '<ul class="viewer-list"></ul>' + '</div>' + '</div>' + '<div class="viewer-tooltip"></div>' + '<div role="button" class="viewer-button" data-viewer-action="mix"></div>' + '<div role="button" class="viewer-left viewer-prev" data-viewer-action="prev"></div>' + '<div role="button" class="viewer-right viewer-next" data-viewer-action="next"></div>' + '<div class="viewer-player"></div>' + '</div>';

  var IN_BROWSER = typeof window !== 'undefined';
  var WINDOW = IN_BROWSER ? window : {};
  var NAMESPACE = 'viewer';

  // Actions
  var ACTION_MOVE = 'move';
  var ACTION_SWITCH = 'switch';
  var ACTION_ZOOM = 'zoom';

  // Classes
  var CLASS_ACTIVE = NAMESPACE + '-active';
  var CLASS_CLOSE = NAMESPACE + '-close';
  var CLASS_FADE = NAMESPACE + '-fade';
  var CLASS_FIXED = NAMESPACE + '-fixed';
  var CLASS_FULLSCREEN = NAMESPACE + '-fullscreen';
  var CLASS_FULLSCREEN_EXIT = NAMESPACE + '-fullscreen-exit';
  var CLASS_HIDE = NAMESPACE + '-hide';
  var CLASS_HIDE_MD_DOWN = NAMESPACE + '-hide-md-down';
  var CLASS_HIDE_SM_DOWN = NAMESPACE + '-hide-sm-down';
  var CLASS_HIDE_XS_DOWN = NAMESPACE + '-hide-xs-down';
  var CLASS_IN = NAMESPACE + '-in';
  var CLASS_INVISIBLE = NAMESPACE + '-invisible';
  var CLASS_LOADING = NAMESPACE + '-loading';
  var CLASS_MOVE = NAMESPACE + '-move';
  var CLASS_OPEN = NAMESPACE + '-open';
  var CLASS_SHOW = NAMESPACE + '-show';
  var CLASS_TRANSITION = NAMESPACE + '-transition';

  // Events
  var EVENT_READY = 'ready';
  var EVENT_SHOW = 'show';
  var EVENT_SHOWN = 'shown';
  var EVENT_HIDE = 'hide';
  var EVENT_HIDDEN = 'hidden';
  var EVENT_VIEW = 'view';
  var EVENT_VIEWED = 'viewed';
  var EVENT_CLICK = 'click';
  var EVENT_DRAG_START = 'dragstart';
  var EVENT_KEY_DOWN = 'keydown';
  var EVENT_LOAD = 'load';
  var EVENT_POINTER_DOWN = WINDOW.PointerEvent ? 'pointerdown' : 'touchstart mousedown';
  var EVENT_POINTER_MOVE = WINDOW.PointerEvent ? 'pointermove' : 'touchmove mousemove';
  var EVENT_POINTER_UP = WINDOW.PointerEvent ? 'pointerup pointercancel' : 'touchend touchcancel mouseup';
  var EVENT_RESIZE = 'resize';
  var EVENT_TRANSITION_END = 'transitionend';
  var EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll';

  // Data keys
  var DATA_ACTION = NAMESPACE + 'Action';
  var BUTTONS = ['download', 'zoom-in', 'zoom-out', 'one-to-one', 'reset', 'prev', 'play', 'next', 'rotate-left', 'rotate-right', 'flip-horizontal', 'flip-vertical'];

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /**
   * Check if the given value is a string.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a string, else `false`.
   */
  function isString(value) {
    return typeof value === 'string';
  }

  /**
   * Check if the given value is not a number.
   */
  var isNaN = Number.isNaN || WINDOW.isNaN;

  /**
   * Check if the given value is a number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a number, else `false`.
   */
  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Check if the given value is undefined.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
   */
  function isUndefined(value) {
    return typeof value === 'undefined';
  }

  /**
   * Check if the given value is an object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is an object, else `false`.
   */
  function isObject(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null;
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * Check if the given value is a plain object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
   */

  function isPlainObject(value) {
    if (!isObject(value)) {
      return false;
    }

    try {
      var _constructor = value.constructor;
      var prototype = _constructor.prototype;


      return _constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if the given value is a function.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a function, else `false`.
   */
  function isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * Iterate the given data.
   * @param {*} data - The data to iterate.
   * @param {Function} callback - The process function for each element.
   * @returns {*} The original data.
   */
  function forEach(data, callback) {
    if (data && isFunction(callback)) {
      if (Array.isArray(data) || isNumber(data.length) /* array-like */) {
          var length = data.length;

          var i = void 0;

          for (i = 0; i < length; i += 1) {
            if (callback.call(data, data[i], i, data) === false) {
              break;
            }
          }
        } else if (isObject(data)) {
        Object.keys(data).forEach(function (key) {
          callback.call(data, data[key], key, data);
        });
      }
    }

    return data;
  }

  /**
   * Extend the given object.
   * @param {*} obj - The object to be extended.
   * @param {*} args - The rest objects which will be merged to the first object.
   * @returns {Object} The extended object.
   */
  var assign = Object.assign || function assign(obj) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (isObject(obj) && args.length > 0) {
      args.forEach(function (arg) {
        if (isObject(arg)) {
          Object.keys(arg).forEach(function (key) {
            obj[key] = arg[key];
          });
        }
      });
    }

    return obj;
  };

  var REGEXP_SUFFIX = /^(?:width|height|left|top|marginLeft|marginTop)$/;

  /**
   * Apply styles to the given element.
   * @param {Element} element - The target element.
   * @param {Object} styles - The styles for applying.
   */
  function setStyle(element, styles) {
    var style = element.style;


    forEach(styles, function (value, property) {
      if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
        value += 'px';
      }

      style[property] = value;
    });
  }

  /**
   * Check if the given element has a special class.
   * @param {Element} element - The element to check.
   * @param {string} value - The class to search.
   * @returns {boolean} Returns `true` if the special class was found.
   */
  function hasClass(element, value) {
    return element.classList ? element.classList.contains(value) : element.className.indexOf(value) > -1;
  }

  /**
   * Add classes to the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be added.
   */
  function addClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        addClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.add(value);
      return;
    }

    var className = element.className.trim();

    if (!className) {
      element.className = value;
    } else if (className.indexOf(value) < 0) {
      element.className = className + ' ' + value;
    }
  }

  /**
   * Remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be removed.
   */
  function removeClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        removeClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.remove(value);
      return;
    }

    if (element.className.indexOf(value) >= 0) {
      element.className = element.className.replace(value, '');
    }
  }

  /**
   * Add or remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be toggled.
   * @param {boolean} added - Add only.
   */
  function toggleClass(element, value, added) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        toggleClass(elem, value, added);
      });
      return;
    }

    // IE10-11 doesn't support the second parameter of `classList.toggle`
    if (added) {
      addClass(element, value);
    } else {
      removeClass(element, value);
    }
  }

  var REGEXP_HYPHENATE = /([a-z\d])([A-Z])/g;

  /**
   * Transform the given string from camelCase to kebab-case
   * @param {string} value - The value to transform.
   * @returns {string} The transformed value.
   */
  function hyphenate(value) {
    return value.replace(REGEXP_HYPHENATE, '$1-$2').toLowerCase();
  }

  /**
   * Get data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to get.
   * @returns {string} The data value.
   */
  function getData(element, name) {
    if (isObject(element[name])) {
      return element[name];
    } else if (element.dataset) {
      return element.dataset[name];
    }

    return element.getAttribute('data-' + hyphenate(name));
  }

  /**
   * Set data to the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to set.
   * @param {string} data - The data value.
   */
  function setData(element, name, data) {
    if (isObject(data)) {
      element[name] = data;
    } else if (element.dataset) {
      element.dataset[name] = data;
    } else {
      element.setAttribute('data-' + hyphenate(name), data);
    }
  }

  /**
   * Remove data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to remove.
   */
  function removeData(element, name) {
    if (isObject(element[name])) {
      try {
        delete element[name];
      } catch (e) {
        element[name] = undefined;
      }
    } else if (element.dataset) {
      // #128 Safari not allows to delete dataset property
      try {
        delete element.dataset[name];
      } catch (e) {
        element.dataset[name] = undefined;
      }
    } else {
      element.removeAttribute('data-' + hyphenate(name));
    }
  }

  var REGEXP_SPACES = /\s\s*/;
  var onceSupported = function () {
    var supported = false;

    if (IN_BROWSER) {
      var once = false;
      var listener = function listener() {};
      var options = Object.defineProperty({}, 'once', {
        get: function get$$1() {
          supported = true;
          return once;
        },


        /**
         * This setter can fix a `TypeError` in strict mode
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only}
         * @param {boolean} value - The value to set
         */
        set: function set$$1(value) {
          once = value;
        }
      });

      WINDOW.addEventListener('test', listener, options);
      WINDOW.removeEventListener('test', listener, options);
    }

    return supported;
  }();

  /**
   * Remove event listener from the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */
  function removeListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var handler = listener;

    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (!onceSupported) {
        var listeners = element.listeners;


        if (listeners && listeners[event] && listeners[event][listener]) {
          handler = listeners[event][listener];
          delete listeners[event][listener];

          if (Object.keys(listeners[event]).length === 0) {
            delete listeners[event];
          }

          if (Object.keys(listeners).length === 0) {
            delete element.listeners;
          }
        }
      }

      element.removeEventListener(event, handler, options);
    });
  }

  /**
   * Add event listener to the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */
  function addListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var _handler = listener;

    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (options.once && !onceSupported) {
        var _element$listeners = element.listeners,
            listeners = _element$listeners === undefined ? {} : _element$listeners;


        _handler = function handler() {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          delete listeners[event][listener];
          element.removeEventListener(event, _handler, options);
          listener.apply(element, args);
        };

        if (!listeners[event]) {
          listeners[event] = {};
        }

        if (listeners[event][listener]) {
          element.removeEventListener(event, listeners[event][listener], options);
        }

        listeners[event][listener] = _handler;
        element.listeners = listeners;
      }

      element.addEventListener(event, _handler, options);
    });
  }

  /**
   * Dispatch event on the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Object} data - The additional event data.
   * @returns {boolean} Indicate if the event is default prevented or not.
   */
  function dispatchEvent(element, type, data) {
    var event = void 0;

    // Event and CustomEvent on IE9-11 are global objects, not constructors
    if (isFunction(Event) && isFunction(CustomEvent)) {
      event = new CustomEvent(type, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, data);
    }

    return element.dispatchEvent(event);
  }

  /**
   * Get the offset base on the document.
   * @param {Element} element - The target element.
   * @returns {Object} The offset data.
   */
  function getOffset(element) {
    var box = element.getBoundingClientRect();

    return {
      left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
      top: box.top + (window.pageYOffset - document.documentElement.clientTop)
    };
  }

  /**
   * Get transforms base on the given object.
   * @param {Object} obj - The target object.
   * @returns {string} A string contains transform values.
   */
  function getTransforms(_ref) {
    var rotate = _ref.rotate,
        scaleX = _ref.scaleX,
        scaleY = _ref.scaleY,
        translateX = _ref.translateX,
        translateY = _ref.translateY;

    var values = [];

    if (isNumber(translateX) && translateX !== 0) {
      values.push('translateX(' + translateX + 'px)');
    }

    if (isNumber(translateY) && translateY !== 0) {
      values.push('translateY(' + translateY + 'px)');
    }

    // Rotate should come first before scale to match orientation transform
    if (isNumber(rotate) && rotate !== 0) {
      values.push('rotate(' + rotate + 'deg)');
    }

    if (isNumber(scaleX) && scaleX !== 1) {
      values.push('scaleX(' + scaleX + ')');
    }

    if (isNumber(scaleY) && scaleY !== 1) {
      values.push('scaleY(' + scaleY + ')');
    }

    var transform = values.length ? values.join(' ') : 'none';

    return {
      WebkitTransform: transform,
      msTransform: transform,
      transform: transform
    };
  }

  /**
   * Get an image name from an image url.
   * @param {string} url - The target url.
   * @example
   * // picture.jpg
   * getImageNameFromURL('http://domain.com/path/to/picture.jpg?size=1280×960')
   * @returns {string} A string contains the image name.
   */
  function getImageNameFromURL(url) {
    return isString(url) ? url.replace(/^.*\//, '').replace(/[?&#].*$/, '') : '';
  }

  var IS_SAFARI = WINDOW.navigator && /(Macintosh|iPhone|iPod|iPad).*AppleWebKit/i.test(WINDOW.navigator.userAgent);

  /**
   * Get an image's natural sizes.
   * @param {string} image - The target image.
   * @param {Function} callback - The callback function.
   * @returns {HTMLImageElement} The new image.
   */
  function getImageNaturalSizes(image, callback) {
    var newImage = document.createElement('img');

    // Modern browsers (except Safari)
    if (image.naturalWidth && !IS_SAFARI) {
      callback(image.naturalWidth, image.naturalHeight);
      return newImage;
    }

    var body = document.body || document.documentElement;

    newImage.onload = function () {
      callback(newImage.width, newImage.height);

      if (!IS_SAFARI) {
        body.removeChild(newImage);
      }
    };

    newImage.src = image.src;

    // iOS Safari will convert the image automatically
    // with its orientation once append it into DOM
    if (!IS_SAFARI) {
      newImage.style.cssText = 'left:0;' + 'max-height:none!important;' + 'max-width:none!important;' + 'min-height:0!important;' + 'min-width:0!important;' + 'opacity:0;' + 'position:absolute;' + 'top:0;' + 'z-index:-1;';
      body.appendChild(newImage);
    }

    return newImage;
  }

  /**
   * Get the related class name of a responsive type number.
   * @param {string} type - The responsive type.
   * @returns {string} The related class name.
   */
  function getResponsiveClass(type) {
    switch (type) {
      case 2:
        return CLASS_HIDE_XS_DOWN;

      case 3:
        return CLASS_HIDE_SM_DOWN;

      case 4:
        return CLASS_HIDE_MD_DOWN;

      default:
        return '';
    }
  }

  /**
   * Get the max ratio of a group of pointers.
   * @param {string} pointers - The target pointers.
   * @returns {number} The result ratio.
   */
  function getMaxZoomRatio(pointers) {
    var pointers2 = assign({}, pointers);
    var ratios = [];

    forEach(pointers, function (pointer, pointerId) {
      delete pointers2[pointerId];

      forEach(pointers2, function (pointer2) {
        var x1 = Math.abs(pointer.startX - pointer2.startX);
        var y1 = Math.abs(pointer.startY - pointer2.startY);
        var x2 = Math.abs(pointer.endX - pointer2.endX);
        var y2 = Math.abs(pointer.endY - pointer2.endY);
        var z1 = Math.sqrt(x1 * x1 + y1 * y1);
        var z2 = Math.sqrt(x2 * x2 + y2 * y2);
        var ratio = (z2 - z1) / z1;

        ratios.push(ratio);
      });
    });

    ratios.sort(function (a, b) {
      return Math.abs(a) < Math.abs(b);
    });

    return ratios[0];
  }

  /**
   * Get a pointer from an event object.
   * @param {Object} event - The target event object.
   * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
   * @returns {Object} The result pointer contains start and/or end point coordinates.
   */
  function getPointer(_ref2, endOnly) {
    var pageX = _ref2.pageX,
        pageY = _ref2.pageY;

    var end = {
      endX: pageX,
      endY: pageY
    };

    return endOnly ? end : assign({
      startX: pageX,
      startY: pageY
    }, end);
  }

  /**
   * Get the center point coordinate of a group of pointers.
   * @param {Object} pointers - The target pointers.
   * @returns {Object} The center point coordinate.
   */
  function getPointersCenter(pointers) {
    var pageX = 0;
    var pageY = 0;
    var count = 0;

    forEach(pointers, function (_ref3) {
      var startX = _ref3.startX,
          startY = _ref3.startY;

      pageX += startX;
      pageY += startY;
      count += 1;
    });

    pageX /= count;
    pageY /= count;

    return {
      pageX: pageX,
      pageY: pageY
    };
  }

  var render = {
    render: function render() {
      this.initContainer();
      this.initViewer();
      this.initList();
      this.renderViewer();
    },
    initContainer: function initContainer() {
      this.containerData = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    initViewer: function initViewer() {
      var options = this.options,
          parent = this.parent;

      var viewerData = void 0;

      if (options.inline) {
        viewerData = {
          width: Math.max(parent.offsetWidth, options.minWidth),
          height: Math.max(parent.offsetHeight, options.minHeight)
        };

        this.parentData = viewerData;
      }

      if (this.fulled || !viewerData) {
        viewerData = this.containerData;
      }

      this.viewerData = assign({}, viewerData);
    },
    renderViewer: function renderViewer() {
      if (this.options.inline && !this.fulled) {
        setStyle(this.viewer, this.viewerData);
      }
    },
    initList: function initList() {
      var _this = this;

      var element = this.element,
          options = this.options,
          list = this.list;

      var items = [];

      forEach(this.images, function (image, i) {
        var src = image.src;

        var alt = image.alt || getImageNameFromURL(src);
        var url = options.url;


        if (isString(url)) {
          url = image.getAttribute(url);
        } else if (isFunction(url)) {
          url = url.call(_this, image);
        }

        if (src || url) {
          items.push('<li>' + '<img' + (' src="' + (src || url) + '"') + ' role="button"' + ' data-viewer-action="view"' + (' data-index="' + i + '"') + (' data-original-url="' + (url || src) + '"') + (' alt="' + alt + '"') + '>' + '</li>');
        }
      });

      list.innerHTML = items.join('');
      this.items = list.getElementsByTagName('li');
      forEach(this.items, function (item) {
        var image = item.firstElementChild;

        setData(image, 'filled', true);

        if (options.loading) {
          addClass(item, CLASS_LOADING);
        }

        addListener(image, EVENT_LOAD, function (event) {
          if (options.loading) {
            removeClass(item, CLASS_LOADING);
          }

          _this.loadImage(event);
        }, {
          once: true
        });
      });

      if (options.transition) {
        addListener(element, EVENT_VIEWED, function () {
          addClass(list, CLASS_TRANSITION);
        }, {
          once: true
        });
      }
    },
    renderList: function renderList(index) {
      var i = index || this.index;
      var width = this.items[i].offsetWidth || 30;
      var outerWidth = width + 1; // 1 pixel of `margin-left` width

      // Place the active item in the center of the screen
      setStyle(this.list, assign({
        width: outerWidth * this.length
      }, getTransforms({
        translateX: (this.viewerData.width - width) / 2 - outerWidth * i
      })));
    },
    resetList: function resetList() {
      var list = this.list;


      list.innerHTML = '';
      removeClass(list, CLASS_TRANSITION);
      setStyle(list, getTransforms({
        translateX: 0
      }));
    },
    initImage: function initImage(done) {
      var _this2 = this;

      var options = this.options,
          image = this.image,
          viewerData = this.viewerData;

      var footerHeight = this.footer.offsetHeight;
      var viewerWidth = viewerData.width;
      var viewerHeight = Math.max(viewerData.height - footerHeight, footerHeight);
      var oldImageData = this.imageData || {};
      var sizingImage = void 0;

      this.imageInitializing = {
        abort: function abort() {
          sizingImage.onload = null;
        }
      };

      sizingImage = getImageNaturalSizes(image, function (naturalWidth, naturalHeight) {
        var aspectRatio = naturalWidth / naturalHeight;
        var width = viewerWidth;
        var height = viewerHeight;

        _this2.imageInitializing = false;

        if (viewerHeight * aspectRatio > viewerWidth) {
          height = viewerWidth / aspectRatio;
        } else {
          width = viewerHeight * aspectRatio;
        }

        width = Math.min(width * 0.9, naturalWidth);
        height = Math.min(height * 0.9, naturalHeight);

        var imageData = {
          naturalWidth: naturalWidth,
          naturalHeight: naturalHeight,
          aspectRatio: aspectRatio,
          ratio: width / naturalWidth,
          width: width,
          height: height,
          left: (viewerWidth - width) / 2,
          top: (viewerHeight - height) / 2
        };
        var initialImageData = assign({}, imageData);

        if (options.rotatable) {
          imageData.rotate = oldImageData.rotate || 0;
          initialImageData.rotate = 0;
        }

        if (options.scalable) {
          imageData.scaleX = oldImageData.scaleX || 1;
          imageData.scaleY = oldImageData.scaleY || 1;
          initialImageData.scaleX = 1;
          initialImageData.scaleY = 1;
        }

        _this2.imageData = imageData;
        _this2.initialImageData = initialImageData;

        if (done) {
          done();
        }
      });
    },
    renderImage: function renderImage(done) {
      var _this3 = this;

      var image = this.image,
          imageData = this.imageData;


      setStyle(image, assign({
        width: imageData.width,
        height: imageData.height,
        marginLeft: imageData.left,
        marginTop: imageData.top
      }, getTransforms(imageData)));

      if (done) {
        if (this.viewing && this.options.transition) {
          var onTransitionEnd = function onTransitionEnd() {
            _this3.imageRendering = false;
            done();
          };

          this.imageRendering = {
            abort: function abort() {
              removeListener(image, EVENT_TRANSITION_END, onTransitionEnd);
            }
          };

          addListener(image, EVENT_TRANSITION_END, onTransitionEnd, {
            once: true
          });
        } else {
          done();
        }
      }
    },
    resetImage: function resetImage() {
      // this.image only defined after viewed
      if (this.viewing || this.viewed) {
        var image = this.image;


        if (this.viewing) {
          this.viewing.abort();
        }

        image.parentNode.removeChild(image);
        this.image = null;
      }
    }
  };

  var events = {
    bind: function bind() {
      var element = this.element,
          viewer = this.viewer;


      addListener(viewer, EVENT_CLICK, this.onClick = this.click.bind(this));
      addListener(viewer, EVENT_WHEEL, this.onWheel = this.wheel.bind(this));
      addListener(viewer, EVENT_DRAG_START, this.onDragStart = this.dragstart.bind(this));
      addListener(this.canvas, EVENT_POINTER_DOWN, this.onPointerDown = this.pointerdown.bind(this));
      addListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onPointerMove = this.pointermove.bind(this));
      addListener(element.ownerDocument, EVENT_POINTER_UP, this.onPointerUp = this.pointerup.bind(this));
      addListener(element.ownerDocument, EVENT_KEY_DOWN, this.onKeyDown = this.keydown.bind(this));
      addListener(window, EVENT_RESIZE, this.onResize = this.resize.bind(this));
    },
    unbind: function unbind() {
      var element = this.element,
          viewer = this.viewer;


      removeListener(viewer, EVENT_CLICK, this.onClick);
      removeListener(viewer, EVENT_WHEEL, this.onWheel);
      removeListener(viewer, EVENT_DRAG_START, this.onDragStart);
      removeListener(this.canvas, EVENT_POINTER_DOWN, this.onPointerDown);
      removeListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onPointerMove);
      removeListener(element.ownerDocument, EVENT_POINTER_UP, this.onPointerUp);
      removeListener(element.ownerDocument, EVENT_KEY_DOWN, this.onKeyDown);
      removeListener(window, EVENT_RESIZE, this.onResize);
    }
  };

  var handlers = {
    click: function click(_ref) {
      var target = _ref.target;
      var options = this.options,
          imageData = this.imageData;

      var action = getData(target, DATA_ACTION);

      switch (action) {
        case 'download':
          this.download(this.image.getAttribute('src'));
          break;

        case 'mix':
          if (this.played) {
            this.stop();
          } else if (options.inline) {
            if (this.fulled) {
              this.exit();
            } else {
              this.full();
            }
          } else {
            this.hide();
          }

          break;

        case 'hide':
          this.hide();
          break;

        case 'view':
          this.view(getData(target, 'index'));
          break;

        case 'zoom-in':
          this.zoom(0.1, true);
          break;

        case 'zoom-out':
          this.zoom(-0.1, true);
          break;

        case 'one-to-one':
          this.toggle();
          break;

        case 'reset':
          this.reset();
          break;

        case 'prev':
          this.prev(options.loop);
          break;

        case 'play':
          this.play(options.fullscreen);
          break;

        case 'next':
          this.next(options.loop);
          break;

        case 'rotate-left':
          this.rotate(-90);
          break;

        case 'rotate-right':
          this.rotate(90);
          break;

        case 'flip-horizontal':
          this.scaleX(-imageData.scaleX || -1);
          break;

        case 'flip-vertical':
          this.scaleY(-imageData.scaleY || -1);
          break;

        default:
          if (this.played) {
            this.stop();
          }
      }
    },
    load: function load() {
      var _this = this;

      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = false;
      }

      var element = this.element,
          options = this.options,
          image = this.image,
          index = this.index,
          viewerData = this.viewerData;


      removeClass(image, CLASS_INVISIBLE);

      if (options.loading) {
        removeClass(this.canvas, CLASS_LOADING);
      }

      image.style.cssText = 'height:0;' + ('margin-left:' + viewerData.width / 2 + 'px;') + ('margin-top:' + viewerData.height / 2 + 'px;') + 'max-width:none!important;' + 'position:absolute;' + 'width:0;';

      this.initImage(function () {
        toggleClass(image, CLASS_MOVE, options.movable);
        toggleClass(image, CLASS_TRANSITION, options.transition);

        _this.renderImage(function () {
          _this.viewed = true;
          _this.viewing = false;

          if (isFunction(options.viewed)) {
            addListener(element, EVENT_VIEWED, options.viewed, {
              once: true
            });
          }

          dispatchEvent(element, EVENT_VIEWED, {
            originalImage: _this.images[index],
            index: index,
            image: image
          });
        });
      });
    },
    loadImage: function loadImage(e) {
      var image = e.target;
      var parent = image.parentNode;
      var parentWidth = parent.offsetWidth || 30;
      var parentHeight = parent.offsetHeight || 50;
      var filled = !!getData(image, 'filled');

      getImageNaturalSizes(image, function (naturalWidth, naturalHeight) {
        var aspectRatio = naturalWidth / naturalHeight;
        var width = parentWidth;
        var height = parentHeight;

        if (parentHeight * aspectRatio > parentWidth) {
          if (filled) {
            width = parentHeight * aspectRatio;
          } else {
            height = parentWidth / aspectRatio;
          }
        } else if (filled) {
          height = parentWidth / aspectRatio;
        } else {
          width = parentHeight * aspectRatio;
        }

        setStyle(image, assign({
          width: width,
          height: height
        }, getTransforms({
          translateX: (parentWidth - width) / 2,
          translateY: (parentHeight - height) / 2
        })));
      });
    },
    keydown: function keydown(e) {
      var options = this.options;


      if (!this.fulled || !options.keyboard) {
        return;
      }

      switch (e.keyCode || e.which || e.charCode) {
        // Escape
        case 27:
          if (this.played) {
            this.stop();
          } else if (options.inline) {
            if (this.fulled) {
              this.exit();
            }
          } else {
            this.hide();
          }

          break;

        // Space
        case 32:
          if (this.played) {
            this.stop();
          }

          break;

        // ArrowLeft
        case 37:
          this.prev(options.loop);
          break;

        // ArrowUp
        case 38:
          // Prevent scroll on Firefox
          e.preventDefault();

          // Zoom in
          this.zoom(options.zoomRatio, true);
          break;

        // ArrowRight
        case 39:
          this.next(options.loop);
          break;

        // ArrowDown
        case 40:
          // Prevent scroll on Firefox
          e.preventDefault();

          // Zoom out
          this.zoom(-options.zoomRatio, true);
          break;

        // Ctrl + 0
        case 48:
        // Fall through

        // Ctrl + 1
        // eslint-disable-next-line no-fallthrough
        case 49:
          if (e.ctrlKey) {
            e.preventDefault();
            this.toggle();
          }

          break;

        default:
      }
    },
    dragstart: function dragstart(e) {
      if (e.target.tagName.toLowerCase() === 'img') {
        e.preventDefault();
      }
    },
    pointerdown: function pointerdown(e) {
      var options = this.options,
          pointers = this.pointers;


      if (!this.viewed || this.showing || this.viewing || this.hiding) {
        return;
      }

      if (e.changedTouches) {
        forEach(e.changedTouches, function (touch) {
          pointers[touch.identifier] = getPointer(touch);
        });
      } else {
        pointers[e.pointerId || 0] = getPointer(e);
      }

      var action = options.movable ? ACTION_MOVE : false;

      if (Object.keys(pointers).length > 1) {
        action = ACTION_ZOOM;
      } else if ((e.pointerType === 'touch' || e.type === 'touchstart') && this.isSwitchable()) {
        action = ACTION_SWITCH;
      }

      this.action = action;
    },
    pointermove: function pointermove(e) {
      var options = this.options,
          pointers = this.pointers,
          action = this.action,
          image = this.image;


      if (!this.viewed || !action) {
        return;
      }

      e.preventDefault();

      if (e.changedTouches) {
        forEach(e.changedTouches, function (touch) {
          assign(pointers[touch.identifier], getPointer(touch, true));
        });
      } else {
        assign(pointers[e.pointerId || 0], getPointer(e, true));
      }

      if (action === ACTION_MOVE && options.transition && hasClass(image, CLASS_TRANSITION)) {
        removeClass(image, CLASS_TRANSITION);
      }

      this.change(e);
    },
    pointerup: function pointerup(e) {
      var action = this.action,
          pointers = this.pointers;


      if (e.changedTouches) {
        forEach(e.changedTouches, function (touch) {
          delete pointers[touch.identifier];
        });
      } else {
        delete pointers[e.pointerId || 0];
      }

      if (!action) {
        return;
      }

      if (action === ACTION_MOVE && this.options.transition) {
        addClass(this.image, CLASS_TRANSITION);
      }

      this.action = false;
    },
    resize: function resize() {
      var _this2 = this;

      if (!this.isShown || this.hiding) {
        return;
      }

      this.initContainer();
      this.initViewer();
      this.renderViewer();
      this.renderList();

      if (this.viewed) {
        this.initImage(function () {
          _this2.renderImage();
        });
      }

      if (this.played) {
        if (this.options.fullscreen && this.fulled && !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
          this.stop();
          return;
        }

        forEach(this.player.getElementsByTagName('img'), function (image) {
          addListener(image, EVENT_LOAD, _this2.loadImage.bind(_this2), {
            once: true
          });
          dispatchEvent(image, EVENT_LOAD);
        });
      }
    },
    wheel: function wheel(e) {
      var _this3 = this;

      if (!this.viewed) {
        return;
      }

      e.preventDefault();

      // Limit wheel speed to prevent zoom too fast
      if (this.wheeling) {
        return;
      }

      this.wheeling = true;

      setTimeout(function () {
        _this3.wheeling = false;
      }, 50);

      var ratio = Number(this.options.zoomRatio) || 0.1;
      var delta = 1;

      if (e.deltaY) {
        delta = e.deltaY > 0 ? 1 : -1;
      } else if (e.wheelDelta) {
        delta = -e.wheelDelta / 120;
      } else if (e.detail) {
        delta = e.detail > 0 ? 1 : -1;
      }

      this.zoom(-delta * ratio, true, e);
    }
  };

  var idSeed = 0;

  var Ext = {
    isIOS: !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),

    emptyFn: function emptyFn() {},
    getDom: function getDom(id) {
      return typeof id === 'string' ? document.getElementById(id) : id;
    },
    id: function id(o, prefix) {
      if (o && o.id) {
        return o.id;
      }
      idSeed += 1;
      var id = (prefix || 'ext-') + idSeed;
      if (o) {
        o.id = id;
      }
      return id;
    },
    isEmpty: function isEmpty(value, allowEmptyString) {
      return value == null || (!allowEmptyString ? value === '' : false) || this.isArray(value) && value.length === 0;
    },


    isArray: 'isArray' in Array ? Array.isArray : function (value) {
      return toString.call(value) === '[object Array]';
    },

    isFunction: typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function' ? function (value) {
      return !!value && toString.call(value) === '[object Function]';
    } : function (value) {
      return !!value && typeof value === 'function';
    }
  };

  /**
   * 通用 文件 帮助类
   * @author jiangwei
   */

  var FileUtil = {

    /**
     * 判断路径是否为完整 file uri
     * @param {String} path 路径
     * @returns {Boolean} 是否 File Uri
     */
    isFileUri: function isFileUri(path) {
      if (Ext.isEmpty(path)) return false;

      return path.substr(0, 7).toLowerCase() === 'file://';
    },


    /**
     * 分割文件路径为 [文件夹路径, 文件名]
     * @param {String} path 文件路径或者文件名或者文件url
     * @returns {String[]} 文件路径和文件名
     */
    splitPath: function splitPath(path) {
      var dirName = '';
      var fileName = '';
      var idx = path.lastIndexOf('/');
      if (idx === -1) {
        fileName = path;
      } else {
        dirName = path.substr(0, idx);
        fileName = path.substr(idx + 1);
      }
      idx = fileName.indexOf('?'); // modified.jpg?1408426399534
      if (idx >= 0) {
        fileName = fileName.substr(0, idx);
      }

      return [dirName, this.stripIllegalChars(fileName)];
    },


    /**
     * 从文件路径提取文件名
     * @param {String} path 文件路径或者文件名或者文件url
     * @returns {String} 文件名
     */
    getFileName: function getFileName(path) {
      if (!path) return '';

      return this.splitPath(path)[1];
    },


    /**
     * 获取文件名，不包括后缀
     * @param {String} fullName 文件名
     * @returns {String} 文件名，不包括后缀
     */
    getFileNameWoExt: function getFileNameWoExt(fullName) {
      if (!fullName) return '';
      var arr = this.splitPath(fullName);
      var idx = arr[1].lastIndexOf('.');
      if (idx < 0) return arr[1];

      return arr[1].substr(0, idx);
    },


    /**
     * 获取后缀，不包括.
     * @param {String} fullName 文件名
     * @param {Boolean} lowerCase 是否返回小写
     * @returns {String} 后缀，不包括.
     */
    getExtension: function getExtension(fullName, lowerCase) {
      if (!fullName) return '';
      var arr = this.splitPath(fullName);
      var idx = arr[1].lastIndexOf('.');
      if (idx < 0) return '';

      var ext = arr[1].substr(idx + 1);

      return lowerCase ? ext.toLowerCase() : ext;
    },


    /**
     * 去除文件名中不合法的字符
     * @param {String} s 原始文件名
     * @returns {String} 文件名
     */
    stripIllegalChars: function stripIllegalChars(s) {
      if (Ext.isEmpty(s)) return s;

      return s.replace(/[\\\\/:*?"<>|]/g, '_');
    }
  };

  if (window.LocalFileSystem === undefined && window.PERSISTENT !== undefined) {
    window.LocalFileSystem = {
      PERSISTENT: window.PERSISTENT,
      TEMPORARY: window.TEMPORARY
    };
  }
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

  var FSUtil = {
    /**
     * 错误编码 和 错误描述
     */
    FILEERROR: {
      1: 'NOT_FOUND_ERR',
      2: 'SECURITY_ERR',
      3: 'ABORT_ERR',
      4: 'NOT_READABLE_ERR',
      5: 'ENCODING_ERR',
      6: 'NO_MODIFICATION_ALLOWED_ERR',
      7: 'INVALID_STATE_ERR',
      8: 'SYNTAX_ERR',
      9: 'INVALID_MODIFICATION_ERR',
      10: 'QUOTA_EXCEEDED_ERR',
      11: 'TYPE_MISMATCH_ERR',
      12: 'PATH_EXISTS_ERR',
      1000: 'UNKNOWN_ERR'
    },

    /**
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} path 完整 file uri 或者 相对路径
     * @returns {Object} 解析后的
     */
    parse: function parse(root, path) {
      var relative = null;
      var full = null;

      if (root === null || root === undefined) {
        // 如果 root 为空，则认为是 1 dataDirectory
        root = 1;
      }

      /**
       * file uri 一般是 encode 过的，如果要转成 目录uri 和 文件名（相对路径） 2部分，应该把文件名 decode
       * 比如，一个文件 uri 是 file:///data/user/0/com.pushsoft.filedemo/files/thumbs/u%3D3990585178%2C1387559702%26fm%3D27%26gp%3D0.jpg
       * 那么，目录 uri 是 file:///data/user/0/com.pushsoft.filedemo/files/thumbs/，
       * 文件名（相对路径）为 u=3990585178,1387559702&fm=27&gp=0.jpg
       *
       * 也就是说 resolveLocalFileSystemURL 的 参数一般都是 encode 过的 url, 不 encode 一般也可以
       * dirEntry.getFile 的参数应该是相对路径，是 decode 过的（或者说是真实的目录和文件名）
       */
      var tempDir = window.cordova ? cordova.file.tempDirectory : null;
      var dataDir = (window.cordova || window.cefMain).file.dataDirectory;
      if (FileUtil.isFileUri(path)) {
        full = path;
        if (tempDir && path.indexOf(tempDir) === 0) {
          root = 0;
          relative = decodeURIComponent(path.substr(tempDir.length));
        } else if (path.indexOf(dataDir) === 0) {
          root = 1;
          relative = decodeURIComponent(path.substr(dataDir.length));
        } else {
          console.error('暂不支持的路径');
        }
      } else {
        relative = path;
        if (root === 0 && tempDir) full = tempDir + path;else if (root === 1) full = dataDir + path;else {
          console.error('暂不支持的路径');
        }
      }

      return {
        root: root,
        relative: relative,
        full: full
      };
    },


    /**
     * 加载临时存储目录，获取其 filesystem
     * 只有 ios 有 tempDirectory
     * @returns {Promise} Promise
     */
    load0: function load0() {
      var me = this;

      return new Promise(function (resolve, reject) {
        if (me.tmpFileSystem) {
          return resolve(me.tmpFileSystem);
        }
        if (!window.requestFileSystem) {
          return reject(new Error('不支持 requestFileSystem'));
        }

        window.resolveLocalFileSystemURL(cordova.file.tempDirectory, // 这里我们用 临时存储目录
        function (entry) {
          me.tmpFileSystem = entry.filesystem;
          resolve(me.tmpFileSystem);
        }, function (err) {
          // <debug>
          console.error('FileSystem', 'load0 failed', err, me.FILEERROR[err.code]);
          // </debug>
          reject(err);
        });
      });
    },


    /**
     * 加载持久化存储目录，获取其 filesystem
     * @returns {Promise} Promise
     */
    load1: function load1() {
      var me = this;

      return new Promise(function (resolve, reject) {
        if (me.fileSystem) {
          return resolve(me.fileSystem);
        }
        if (!window.requestFileSystem) {
          return reject(new Error('不支持 requestFileSystem'));
        }

        window.resolveLocalFileSystemURL((window.cordova || window.cefMain).file.dataDirectory, // 这里我们用 持久化存储目录
        function (entry) {
          me.fileSystem = entry.filesystem;
          resolve(me.fileSystem);
        }, function (err) {
          // <debug>
          console.error('FileSystem', 'load1 failed', err, me.FILEERROR[err.code]);
          // </debug>
          reject(err);
        });
      });
    }
  };

  var DirMgr = {

    /**
     * 多次调用create创建同一个临时存储目录，会进入此队列，这样只需要调用一次create_r
     */
    queues0: {}, // tempDirectory
    /**
     * 多次调用create创建同一个持久化存储目录，会进入此队列，这样只需要调用一次create_r
     */
    queues1: {}, // dataDirectory

    /**
     * 级联创建目录，比如 xxx/yyy/zzz/，就需要级联三次分别创建 xxx,yyy,zzz
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} relativeDir 要创建的目录，相对路径
     * @param {Function} success 成功回调
     * @param {Function} fail 失败回调
     * @param {int} position 位置，比如0就从xxx开始创建，1就是从yyy开始创建
     */
    create_r: function create_r(root, relativeDir, success, fail, position) {
      position = typeof position === 'undefined' ? 0 : position;

      var me = this;
      var pathSplit = relativeDir.split('/');
      var newPosition = position + 1;
      var subPath = pathSplit.slice(0, newPosition).join('/');

      var innerCB = function innerCB(args) {
        return function () {
          me.create_r.apply(me, toConsumableArray(args));
        };
      };

      if (newPosition === pathSplit.length || /\/$/.test(subPath)) {
        me.create_one(root, subPath, success, fail);
      } else {
        me.create_one(root, subPath, innerCB([root, relativeDir, success, fail, newPosition]), fail);
      }
    },

    /**
     * 单独创建一层子目录
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} relativeDir 要创建的目录，相对路径
     * @param {Function} success 成功回调
     * @param {Function} fail 失败回调
     */
    create_one: function create_one(root, relativeDir, success, fail) {
      FSUtil['load' + root]().then(function (fs) {
        // 单独使用 exclusive: true 这个设置，没什么作用.
        // 但是和 create: true 一起使用, 如果目标路径已存在，那么 getFile 和 getDirectory 就会执行失败.
        // 此处 我们不想它执行失败，所以设为 false
        fs.root.getDirectory(relativeDir, {
          create: true, // 如果不存在，就创建目录
          exclusive: false
        }, function (dirEntry) {
          if (success) success(dirEntry);
        }, function (err) {
          // <debug>
          console.error('DirMgr', 'create directory failed', FSUtil.FILEERROR[err.code]);
          // </debug>
          if (fail) fail(err);
        });
      }).catch(fail);
    },


    /**
     * 创建目录
     * 多次创建同一个目录，多个任务进队列，实际只会创建一次。
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} dir 要创建的目录，相对路径或者完整 file uri(支持多层级)
     * @returns {Promise} Promise
     */
    create: function create(root, dir) {
      var me = this;

      return new Promise(function (resolve, reject) {
        var o = FSUtil.parse(root, dir);
        var relativeDir = o.relative;
        var queueName = 'queues' + o.root;
        var queue = me[queueName][relativeDir];

        // 任务队列不存在
        if (!queue) {
          queue = []; // 创建队列
          me[queueName][relativeDir] = queue;

          // 只有第一个任务加入队列的时候，才会执行逻辑。其它任务进来都直接进队列
          var success = function success(entry) {
            var q = me[queueName][relativeDir];
            if (q) {
              while (q.length) {
                var obj = q.shift();
                if (obj.resolve) obj.resolve(entry);
              }
              delete me[queueName][relativeDir];
            }
          };
          var fail = function fail(err) {
            var q = me[queueName][relativeDir];
            if (q) {
              while (q.length) {
                var obj = q.shift();
                if (obj.reject) obj.reject(err);
              }
              delete me[queueName][relativeDir];
            }
          };

          // 检查是否已经存在这个多级目录
          FSUtil['load' + o.root]().then(function (fs) {
            fs.root.getDirectory(relativeDir, {
              create: false
            }, success, // 已经存在这个多级目录，直接使用
            function (err) {
              if (err.code === 1) {
                // 不存在，才级联创建目录
                me.create_r(o.root, relativeDir, success, fail);
              } else {
                // 其他异常
                fail(err);
              }
            });
          }).catch(fail);
        }

        // 任务加入队列
        queue.push({
          resolve: resolve,
          reject: reject
        });
      });
    },

    /**
     * 复制一个文件
     *
     * @param {Number} fromRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} fromPath 源目录路径，完整 file uri 或 相对路径
     * @param {Number} toRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} toPath 目标目录路径，完整 file uri 或 相对路径
     * @returns {Promise} Promise
     */
    moveTo: function moveTo(fromRoot, fromPath, toRoot, toPath) {
      var me = this;
      return new Promise(function (resolve, reject) {
        me.copyOrMove(fromRoot, fromPath, toRoot, toPath, 2, true, resolve, reject);
      });
    },

    /**
     * 剪切一个文件
     *
     * @param {Number} fromRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} fromPath 源目录路径，完整 file uri 或 相对路径
     * @param {Number} toRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} toPath 目标目录路径，完整 file uri 或 相对路径
     * @returns {Promise} Promise
     */
    copyTo: function copyTo(fromRoot, fromPath, toRoot, toPath) {
      var me = this;
      return new Promise(function (resolve, reject) {
        me.copyOrMove(fromRoot, fromPath, toRoot, toPath, 2, false, resolve, reject);
      });
    },


    /**
     * 把一个文件从一处 复制或剪切 到另一处
     *
     * @param {Number} fromRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} fromPath 源文件路径(带文件名)，完整 file uri 或 相对路径
     * @param {Number} toRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} toPath 目标文件路径(带文件名)，相对路径
     * @param {Number} type 1 File / 2 Directory
     * @param {Boolean} isMove 是否剪切? true剪切，false复制
     * @param {Function} success 成功回调
     * @param {Function} fail 失败回调
     */
    copyOrMove: function copyOrMove(fromRoot, fromPath, toRoot, toPath, type, isMove, success, fail) {
      if (Ext.isEmpty(fromPath) || Ext.isEmpty(toPath)) return;

      var me = this;
      success = Ext.isFunction(success) ? success : Ext.emptyFn;
      var failure = function failure(err) {
        // <debug>
        console.error('DirMgr', 'copyOrMove failed', err.code ? me.FILEERROR[err.code] : err);
        // </debug>
        if (Ext.isFunction(fail)) fail(err);
      };

      var toO = me.parse(toRoot, toPath);
      var toRelativePath = toO.relative;

      var arr = FileUtil.splitPath(toRelativePath);
      var toRelativeDir = arr[0];
      var toName = arr[1];

      // 创建目标目录
      me.create(toRoot, toRelativeDir).then(function (dir) {
        if (FileUtil.isFileUri(fromPath)) {
          // 完整 file uri
          window.resolveLocalFileSystemURL(fromPath, function (file) {
            file[isMove ? 'moveTo' : 'copyTo'](dir, toName, function (f) {
              success(f.toURL());
            }, failure);
          }, failure);
        } else {
          var fromO = me.parse(fromRoot, fromPath);
          var fromRelativePath = fromO.relative;

          me['load' + fromO.root]().then(function (fs) {
            var method = '';
            if (type === 1) {
              method = 'getFile';
            } else if (type === 2) {
              method = 'getDirectory';
            }
            if (method) {
              fs.root[method](fromRelativePath, {
                create: false
              }, function (file) {
                file[isMove ? 'moveTo' : 'copyTo'](dir, toName, function (f) {
                  success(f.toURL());
                }, failure);
              }, failure);
            } else {
              failure('unknown exception');
            }
          }).catch(failure);
        }
      }).catch(failure);
    },


    /**
     * 删除一个目录(级联删除)
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} dir 要删除的目录，相对路径或者完整 file uri
     * @returns {Promise} Promise
     */
    remove: function remove(root, dir) {
      return new Promise(function (resolve, reject) {
        var o = FSUtil.parse(root, dir);
        var relativeDir = o.relative;

        FSUtil['load' + o.root]().then(function (fs) {
          fs.root.getDirectory(relativeDir, {
            create: false // 如果不存在，不创建目录
          }, function (dirEntry) {
            // 找到目录，执行级联删除
            dirEntry.removeRecursively(resolve, reject);
          }, function (err) {
            if (err.code !== 1) {
              reject(err);
            }
          });
        }).catch(reject);
      });
    }
  };

  /**
   * @author 神秘博士
   * date 20170409
   * 文件管理类
   *
   * 以下说到的
   * 相对路径，都指的是 相对于 cordova.file.dataDirectory 目录
   * 完整 file uri，都指的是 file:// 开头的路径
   */

  var FileMgr = {

    /**
     * 下载一个文件，
     * 该函数利用了已经下载的文件缓存(比如用于下载并缓存图片，节省流量和时间)：
     * 如果 saveDir 目录下已经有了 saveName 这个文件，那么就不下载而直接使用此文件
     *
     * @param {String} url 文件下载地址，比如 http://......
     * @param {Number} saveRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} savePath 保存到的路径(含文件名，目录存不存在都可以，此方法会自动创建目录)，完整 file uri或者相对路径
     * @param {Object} options 可选项，结构如下
     * {
     *  downloading: function(percent){}, // 下载中 回调(参数是进度)
     *  force: true/false // 是否强制下载? 如果想忽略文件缓存，强制重新下载一遍，可以设置为 true
     * }
     * @returns {Promise} Promise
     */
    downFile: function downFile(url, saveRoot, savePath, options) {
      var me = this;

      return new Promise(function (resolve, reject) {
        var force = !!(options && options.force); // 强制重新下载，不管文件是否存在
        var o = FSUtil.parse(saveRoot, savePath);
        var relativePath = o.relative; // 下载到的相对路径
        var arr = FileUtil.splitPath(relativePath);
        var saveDir = arr[0]; // 要下载到的目录的相对路径
        var saveName = arr[1]; // 要保存的文件名

        var queueName = 'queues' + o.root;
        var key = relativePath;
        var queue = me[queueName][key];

        if (!queue) {
          queue = [];
          me[queueName][key] = queue;

          var success = function success(entry) {
            // <debug>
            console.log('file download succeed', entry);
            // </debug>
            var q = me[queueName][key];
            if (q) {
              while (q.length) {
                var obj = q.shift();
                if (obj.resolve) obj.resolve(entry.toURL());
              }
              delete me[queueName][key];
            }
          };
          var fail = function fail(error) {
            // <debug>
            console.log('file download failed', error);
            // </debug>
            var q = me[queueName][key];
            if (q) {
              while (q.length) {
                var obj = q.shift();
                if (obj.reject) obj.reject(error);
              }
              delete me[queueName][key];
            }
          };

          var doDownload = function doDownload(path) {
            var ft = new FileTransfer();
            ft.onprogress = function (result) {
              if (result.lengthComputable) {
                var percent = (result.loaded / (result.total * 100)).toFixed(2); // 下载百分比

                var q = me[queueName][key];
                if (q && q.length) {
                  q.forEach(function (x) {
                    if (x.downloading) {
                      x.downloading(percent);
                    }
                  });
                }
              }
            };
            ft.download(url, path, success, fail);
          };

          DirMgr.create(o.root, saveDir).then(function (dirEntry) {
            var saveFullURI = dirEntry.toURL() + encodeURIComponent(saveName);

            if (force) {
              // 强制重新下载，不管文件是否存在
              doDownload(saveFullURI);
            } else {
              // 先检查文件是否已经存在
              dirEntry.getFile(saveName, {
                create: false
              }, function (fileEntry) {
                // <debug>
                console.log('file found', fileEntry);
                // </debug>
                success(fileEntry, true); // 文件已存在，直接返回此文件路径
              }, function (err) {
                if (err.code === 1) {
                  // 否则就到网络下载文件!
                  doDownload(saveFullURI);
                } else {
                  fail(err);
                }
              });
            }
          }).catch(fail);
        }

        queue.push({
          resolve: resolve,
          reject: reject,
          downloading: options && Ext.isFunction(options.downloading) ? options.downloading : null
        });
      });
    },


    // 和上面方法差不多，只不过用于下载图片在 ios 的 <img src> 中显示
    downFileForSrc: function downFileForSrc() {
      var me = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var url = args.url,
          saveRoot = args.saveRoot,
          savePath = args.savePath,
          options = args.options;

      var o = FSUtil.parse(saveRoot, savePath);

      // iOS + Cordova + WKWebview + 图片必须在 tmp 目录，才能显示在 <img src> 中
      // window.indexedDB 存在 则认为是 WKWebview
      if (window.cordova && Ext.isIOS && window.indexedDB && o.root !== 0) {
        return new Promise(function (resolve, reject) {
          var queueName = 'srcQueues' + o.root;
          var key = o.relative;
          var queue = me[queueName][key];

          if (!queue) {
            queue = [];
            me[queueName][key] = queue;

            var success = function success(fileURL) {
              // <debug>
              console.log('file download succeed', fileURL);
              // </debug>
              var q = me[queueName][key];
              if (q) {
                while (q.length) {
                  var obj = q.shift();
                  if (obj.resolve) obj.resolve(fileURL);
                }
                delete me[queueName][key];
              }
            };
            var fail = function fail(error) {
              // <debug>
              console.log('file download failed', error);
              // </debug>
              var q = me[queueName][key];
              if (q) {
                while (q.length) {
                  var obj = q.shift();
                  if (obj.reject) obj.reject(error);
                }
                delete me[queueName][key];
              }
            };

            var force = !!(options && options.force);
            // 下载后拷贝到 tmp
            var downAndCopy = function downAndCopy() {
              // 先下载
              me.downFile(url, o.root, o.relative, {
                force: force,
                downloading: function downloading(percent) {
                  var q = me[queueName][key];
                  if (q && q.length) {
                    q.forEach(function (x) {
                      if (x.downloading) {
                        x.downloading(percent);
                      }
                    });
                  }
                }
              }).then(function (filePath) {
                return me.copyTo(o.root, filePath, 0, o.relative) // 拷贝一份到 tmp 目录
                .then(function (tmpFileURL) {
                  success(tmpFileURL);
                });
              }).catch(fail);
            };

            if (force) {
              downAndCopy();
            } else {
              // 先检查 tmp 下有没有该文件
              me.exists(0, o.relative).then(function (fileEntry) {
                if (fileEntry) {
                  // 如果有
                  var fileURL = fileEntry.toURL();
                  success(fileURL);

                  me.exists(1, o.relative).then(function (exists) {
                    if (!exists) {
                      // 如果 dataDirectory 下没有这个文件，就将其拷贝到 dataDirectory 下
                      return me.copyTo(0, fileURL, o.root, o.relative); // 拷贝一份到 dataDirectory 目录
                    }
                  });
                } else {
                  // 没有就下载
                  downAndCopy();
                }
              }).catch(fail);
            }
          }

          queue.push({
            resolve: resolve,
            reject: reject,
            downloading: options && Ext.isFunction(options.downloading) ? options.downloading : null
          });
        });
      }

      return me.downFile.apply(me, toConsumableArray(args));
    },


    /**
     * 删除一个文件
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} path 文件路径，完整 file uri 或 相对路径
     * @returns {Promise} Promise
     */
    remove: function remove(root, path) {
      return new Promise(function (resolve, reject) {
        var fail = function fail(err) {
          // <debug>
          console.error('FileMgr', 'remove failed', err.code ? FSUtil.FILEERROR[err.code] : err);
          // </debug>
          reject(err);
        };

        if (Ext.isEmpty(path)) fail('路径为空');

        if (FileUtil.isFileUri(path)) {
          // 完整 file uri
          window.resolveLocalFileSystemURL(path, function (file) {
            file.remove(resolve, fail);
          }, fail);
        } else {
          // 相对路径
          // 有可能 root，没有传入值，有可能 dir 是完整 file uri。此处解析成 相对路径 和 正确的 root
          var o = FSUtil.parse(root, path);
          var relativePath = o.relative;

          FSUtil['load' + o.root]().then(function (fs) {
            fs.root.getFile(relativePath, {
              create: false,
              exclusive: false
            }, function (file) {
              file.remove(resolve, fail);
            }, fail);
          }).catch(fail);
        }
      });
    },

    /**
     * 判断文件是否存在
     *
     * @param {Number} root 0 tempDirectory / 1 dataDirectory / null
     * @param {String} filePath 文件路径(带文件名)，完整 file uri 或 相对路径
     * @returns {Promise} Promise
     */
    exists: function exists(root, filePath) {
      return new Promise(function (resolve, reject) {
        var fail = function fail(err) {
          // <debug>
          console.error('FileMgr', 'check exists failed', err.code ? FSUtil.FILEERROR[err.code] : err);
          // </debug>
          reject(err);
        };

        if (Ext.isEmpty(filePath)) fail('路径为空');

        var o = FSUtil.parse(root, filePath);
        var relativePath = o.relative;

        FSUtil['load' + o.root]().then(function (fs) {
          fs.root.getFile(relativePath, {
            create: false
          }, resolve, function (err) {
            if (err.code === 1) {
              // 未找到
              resolve(null);
            } else {
              reject(err);
            }
          });
        }).catch(fail);
      });
    },

    /**
     * 复制一个文件
     *
     * @param {Number} fromRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} fromPath 源文件路径(带文件名)，完整 file uri 或 相对路径
     * @param {Number} toRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} toPath 目标文件路径(带文件名)，完整 file uri 或 相对路径
     * @returns {Promise} Promise
     */
    moveTo: function moveTo(fromRoot, fromPath, toRoot, toPath) {
      return new Promise(function (resolve, reject) {
        DirMgr.copyOrMove(fromRoot, fromPath, toRoot, toPath, 1, true, resolve, reject);
      });
    },

    /**
     * 剪切一个文件
     *
     * @param {Number} fromRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} fromPath 源文件路径(带文件名)，完整 file uri 或 相对路径
     * @param {Number} toRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} toPath 目标文件路径(带文件名)，完整 file uri 或 相对路径
     * @returns {Promise} Promise
     */
    copyTo: function copyTo(fromRoot, fromPath, toRoot, toPath) {
      return new Promise(function (resolve, reject) {
        DirMgr.copyOrMove(fromRoot, fromPath, toRoot, toPath, 1, false, resolve, reject);
      });
    },


    /**
     * 解决命名冲突
     * 场景：多次下载同名文件到某个目录下，为了不覆盖已有文件，就需要先使用此方法获取一个不冲突的文件名
     * 比如：下载1.txt到file/目录下，但是原本已经存在了一个1.txt，那么使用该方法获取一个可用文件名1 (1).txt
     *
     * @param {Number} saveRoot 0 tempDirectory / 1 dataDirectory / null
     * @param {String} saveDir 目标目录(此目录必须已存在)，完整 file uri或相对路径
     * @param {String} saveName 目标文件名，如1.txt
     * @returns {Promise} Promise
     */
    solveDup: function solveDup(saveRoot, saveDir, saveName) {
      var me = this;

      return new Promise(function (resolve, reject) {
        var fail = function fail(err) {
          // <debug>
          console.error('FileMgr', 'solveDup failed', err.code ? FSUtil.FILEERROR[err.code] : err);
          // </debug>
          reject(err);
        };

        if (FileUtil.isFileUri(saveDir)) {
          // 完整 file uri
          window.resolveLocalFileSystemURL(saveDir, function (dir) {
            var name = FileUtil.getFileNameWoExt(saveName);
            var ext = FileUtil.getExtension(saveName);
            me.solveDupInner(dir, name, ext, 0, resolve);
          }, fail);
        } else {
          var o = FSUtil.parse(saveRoot, saveDir);
          var relativeDir = o.relative;

          FSUtil['load' + o.root]().then(function (fs) {
            fs.root.getDirectory(relativeDir, {
              create: false
            }, function (dir) {
              var name = FileUtil.getFileNameWoExt(saveName);
              var ext = FileUtil.getExtension(saveName);
              me.solveDupInner(dir, name, ext, 0, resolve);
            }, fail);
          }).catch(fail);
        }
      });
    },


    /**
     * 打开文件
     * @param {String/FileEntry} file 文件Entry 或者 fileUri
     * @returns {Promise} Promise
     */
    open: function open(file) {
      return new Promise(function (resolve, reject) {
        var url = file;
        if (window.FileEntry && file instanceof window.FileEntry) {
          url = file.toURL();
        }
        url = decodeURIComponent(url);

        if (window.plugins && plugins.fileOpener) {
          plugins.fileOpener.open(url, resolve, function (err) {
            reject(err);
            alert(err.message || '');
          });
        } else if (window.cefMain) {
          cefMain.open(url, resolve, function (err) {
            reject(err);
            alert(err.message || '');
          });
        }
      });
    },


    /*
    存储 被下载的目标文件名 和 下载任务 的映射，
    因为下载一个文件 可能 被多个地方用（也就是被多个地方回调），比如下载头像的时候，一个view有多个地方下载同一头像
     map 里面存储的键值对如下：
    'images/****': [{
        success: xx,
        fail: yy,
        downloading: zz,
        scope: ww
    }]
    */
    queues0: {},
    queues1: {},

    /**
     * 和上面一样，用于 downFileForSrc
     */
    srcQueues0: {},
    srcQueues1: {},

    solveDupInner: function solveDupInner(dirEntry, saveName, saveExtension, times, success) {
      var me = this;
      var newName = saveName + (times === 0 ? '.' : ' (' + times + ').') + saveExtension;
      dirEntry.getFile(newName, {
        create: false
      }, function () {
        me.solveDupInner(dirEntry, saveName, saveExtension, times + 1, success);
      }, function () {
        success(newName);
      });
    }
  };

  var failedImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAwCAMAAACR11I4AAAAhFBMVEUAAACww9jj7fjA0OEAAAADAwP3+vwEBAQAAAALCwvExsgICAgKCgrMz9P6+vrIy8+ipah5eXnn5+f39/jt7e3P1Nq6vL/z8/P8/Py/zNr////Y4u3I2er7/P3q8fjG3PTu8/jC2fHn7vbw9fq70enp8PbK3/bt8vjP4/i91e/T5vvR5fr6AzUjAAAAGnRSTlMA/fj9Aiv9BhMMYyIahulBIEaN2LGqeMru1WReUU4AAAJ4SURBVHhepdbrkqMgEIDRIAyIRnMzyU4D3nObff/32243biYRXVPz/ZuC02TUslz8PKE89UuTiY6vdjDouKY1lcFUuxVt0ql3jQaoMIGpUo0+BGgGOUhXaiH08uDANSMBhF5PIYvwIuhl9AsHvO9rE8gtDlDLTQruXX/iDOOZFkKFmx249/yF8RvG2G5NAz6OAG953t66WktXUek4A5ATvnyJE6Y4yIhuQ7wHcOVrY/7U9r51AEk3IHHg5vqm6n1VOoDs74MgQc70pem9wWEA2+5BSIwb9/4fUHU8W6JXEWNmri8vRYUVZSkB9jE9BQd2q/hs38g8CHJJT3HS8QR51ZoRfxmEE5qmdCCjJfE9qyj+vGnCU8jTTfe/fyKn2tMbvnGw24TI9Sev7pn5vgE4Ehdr1hZ9fK4nnsXEV8T72mCmv9834rfiW9br8+8ZxqwEdyCuIlYV3+On/JHX18wW3Hb3bSESVpyfKsz/PCfRso3GJYV/vMR9/vTI2A5YthLot8Grt/Vjr8/zfh/HAUIPB5hJb6rrvYJHqhtwfY5P+Zo/Np554htQmQlvz09H7X0D7NDX9wI8fjggCZ593TfwyJ/jn3ow4GzGvLHX1yxfi9cBdszT8f4BUTDDm/NvT2e+6gY8Fq7G7zkC74DoZYD1++uXvyunl1AUfPUZv89HfLBFL9b8n8/9vnGDAODXMaI3MH1k9QvlwPuTALtNrNVCqK0Dl9d9s3zjQCYfoRJCrI8AksR8n0uAbLPU9PqnT6hLPepT8JYeYjwcL1wGY6XkdeQdsMfDBX2dpuM80uhVGH94outG6SUu+4vDbovSvpQgTavjIf9pfwA8bC3+UnIYZgAAAABJRU5ErkJggg==";

  var methods = {
    /** Show the viewer (only available in modal mode)
     * @param {boolean} [immediate=false] - Indicates if show the viewer immediately or not.
     * @returns {Viewer} this
     */
    show: function show() {
      var immediate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var element = this.element,
          options = this.options;


      if (options.inline || this.showing || this.isShown || this.showing) {
        return this;
      }

      if (!this.ready) {
        this.build();

        if (this.ready) {
          this.show(immediate);
        }

        return this;
      }

      if (isFunction(options.show)) {
        addListener(element, EVENT_SHOW, options.show, {
          once: true
        });
      }

      if (dispatchEvent(element, EVENT_SHOW) === false || !this.ready) {
        return this;
      }

      if (this.hiding) {
        this.transitioning.abort();
      }

      this.showing = true;
      this.open();

      var viewer = this.viewer;


      removeClass(viewer, CLASS_HIDE);

      if (options.transition && !immediate) {
        var shown = this.shown.bind(this);

        this.transitioning = {
          abort: function abort() {
            removeListener(viewer, EVENT_TRANSITION_END, shown);
            removeClass(viewer, CLASS_IN);
          }
        };

        addClass(viewer, CLASS_TRANSITION);

        // Force reflow to enable CSS3 transition
        // eslint-disable-next-line
        viewer.offsetWidth;
        addListener(viewer, EVENT_TRANSITION_END, shown, {
          once: true
        });
        addClass(viewer, CLASS_IN);
      } else {
        addClass(viewer, CLASS_IN);
        this.shown();
      }

      return this;
    },


    /**
     * Hide the viewer (only available in modal mode)
     * @param {boolean} [immediate=false] - Indicates if hide the viewer immediately or not.
     * @returns {Viewer} this
     */
    hide: function hide() {
      var immediate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var element = this.element,
          options = this.options;


      if (options.inline || this.hiding || !(this.isShown || this.showing)) {
        return this;
      }

      if (isFunction(options.hide)) {
        addListener(element, EVENT_HIDE, options.hide, {
          once: true
        });
      }

      if (dispatchEvent(element, EVENT_HIDE) === false) {
        return this;
      }

      if (this.showing) {
        this.transitioning.abort();
      }

      this.hiding = true;

      if (this.played) {
        this.stop();
      } else if (this.viewing) {
        this.viewing.abort();
      }

      var viewer = this.viewer;


      if (options.transition && !immediate) {
        var hidden = this.hidden.bind(this);
        var hide = function hide() {
          addListener(viewer, EVENT_TRANSITION_END, hidden, {
            once: true
          });
          removeClass(viewer, CLASS_IN);
        };

        this.transitioning = {
          abort: function abort() {
            if (this.viewed) {
              removeListener(this.image, EVENT_TRANSITION_END, hide);
            } else {
              removeListener(viewer, EVENT_TRANSITION_END, hidden);
            }
          }
        };

        if (this.viewed) {
          addListener(this.image, EVENT_TRANSITION_END, hide, {
            once: true
          });
          this.zoomTo(0, false, false, true);
        } else {
          hide();
        }
      } else {
        removeClass(viewer, CLASS_IN);
        this.hidden();
      }

      return this;
    },


    /**
     * View one of the images with image's index
     * @param {number} index - The index of the image to view.
     * @returns {Viewer} this
     */
    view: function view() {
      var _this = this;

      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      index = Number(index) || 0;

      if (!this.isShown) {
        this.index = index;
        return this.show();
      }

      if (this.hiding || this.played || index < 0 || index >= this.length || this.viewed && index === this.index) {
        return this;
      }

      if (this.viewing) {
        this.viewing.abort();
      }

      var element = this.element,
          options = this.options,
          title = this.title,
          canvas = this.canvas;

      var item = this.items[index];
      var img = item.querySelector('img');
      var url = getData(img, 'originalUrl');
      var alt = img.getAttribute('alt');
      var image = document.createElement('img');

      // 如果是 cordova（或者 cef）, 而且 url 可下载
      if ((window.cordova || window.cefMain) && /https?:\/\//i.test(url)) {
        var nodeId = Ext.id(image); // 防止 node 节点没有id，给它一个id
        var picName = FileUtil.getFileName(url);

        var dir = options.saveDir;
        if (!Ext.isEmpty(dir) && dir.charAt(dir.length - 1) !== '/') {
          dir += '/';
        }

        FileMgr.downFileForSrc(url, 1, '' + dir + picName, {}).then(function (path) {
          var node = Ext.getDom(nodeId);
          if (node && node === _this.image) {
            _this.viewing.abort();
            node.src = path;
          }
        }).catch(function (err) {
          console.log(err);
          var node = Ext.getDom(nodeId);
          if (node && node === _this.image) {
            _this.viewing.abort();
            node.src = failedImg;
          }
        });
      } else {
        image.src = url;
      }

      // image.src = url;
      image.alt = alt;

      if (isFunction(options.view)) {
        addListener(element, EVENT_VIEW, options.view, {
          once: true
        });
      }

      if (dispatchEvent(element, EVENT_VIEW, {
        originalImage: this.images[index],
        index: index,
        image: image
      }) === false || !this.isShown || this.hiding || this.played) {
        return this;
      }

      this.image = image;
      removeClass(this.items[this.index], CLASS_ACTIVE);
      addClass(item, CLASS_ACTIVE);
      this.viewed = false;
      this.index = index;
      this.imageData = {};
      addClass(image, CLASS_INVISIBLE);

      if (options.loading) {
        addClass(canvas, CLASS_LOADING);
      }

      canvas.innerHTML = '';
      canvas.appendChild(image);

      // Center current item
      this.renderList();

      // Clear title
      title.innerHTML = '';

      // Generate title after viewed
      var onViewed = function onViewed() {
        var imageData = _this.imageData;


        title.textContent = alt + ' (' + imageData.naturalWidth + ' \xD7 ' + imageData.naturalHeight + ')';
      };
      var onLoad = void 0;

      addListener(element, EVENT_VIEWED, onViewed, {
        once: true
      });

      this.viewing = {
        abort: function abort() {
          removeListener(element, EVENT_VIEWED, onViewed);

          if (image.complete) {
            if (this.imageRendering) {
              this.imageRendering.abort();
            } else if (this.imageInitializing) {
              this.imageInitializing.abort();
            }
          } else {
            removeListener(image, EVENT_LOAD, onLoad);

            if (this.timeout) {
              clearTimeout(this.timeout);
            }
          }
        }
      };

      if (image.complete) {
        this.load();
      } else {
        addListener(image, EVENT_LOAD, onLoad = this.load.bind(this), {
          once: true
        });

        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        // Make the image visible if it fails to load within 1s
        this.timeout = setTimeout(function () {
          removeClass(image, CLASS_INVISIBLE);
          _this.timeout = false;
        }, 1000);
      }

      return this;
    },


    /**
     * View the previous image
     * @param {boolean} [loop=false] - Indicate if view the last one
     * when it is the first one at present.
     * @returns {Viewer} this
     */
    prev: function prev() {
      var loop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var index = this.index - 1;

      if (index < 0) {
        index = loop ? this.length - 1 : 0;
      }

      this.view(index);
      return this;
    },


    /**
     * View the next image
     * @param {boolean} [loop=false] - Indicate if view the first one
     * when it is the last one at present.
     * @returns {Viewer} this
     */
    next: function next() {
      var loop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var maxIndex = this.length - 1;
      var index = this.index + 1;

      if (index > maxIndex) {
        index = loop ? 0 : maxIndex;
      }

      this.view(index);
      return this;
    },


    /**
     * Move the image with relative offsets.
     * @param {number} offsetX - The relative offset distance on the x-axis.
     * @param {number} offsetY - The relative offset distance on the y-axis.
     * @returns {Viewer} this
     */
    move: function move(offsetX, offsetY) {
      var imageData = this.imageData;


      this.moveTo(isUndefined(offsetX) ? offsetX : imageData.left + Number(offsetX), isUndefined(offsetY) ? offsetY : imageData.top + Number(offsetY));

      return this;
    },


    /**
     * Move the image to an absolute point.
     * @param {number} x - The x-axis coordinate.
     * @param {number} [y=x] - The y-axis coordinate.
     * @returns {Viewer} this
     */
    moveTo: function moveTo(x) {
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
      var imageData = this.imageData;


      x = Number(x);
      y = Number(y);

      if (this.viewed && !this.played && this.options.movable) {
        var changed = false;

        if (isNumber(x)) {
          imageData.left = x;
          changed = true;
        }

        if (isNumber(y)) {
          imageData.top = y;
          changed = true;
        }

        if (changed) {
          this.renderImage();
        }
      }

      return this;
    },


    /**
     * Zoom the image with a relative ratio.
     * @param {number} ratio - The target ratio.
     * @param {boolean} [hasTooltip=false] - Indicates if it has a tooltip or not.
     * @param {Event} [_originalEvent=null] - The original event if any.
     * @returns {Viewer} this
     */
    zoom: function zoom(ratio) {
      var hasTooltip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var _originalEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var imageData = this.imageData;


      ratio = Number(ratio);

      if (ratio < 0) {
        ratio = 1 / (1 - ratio);
      } else {
        ratio = 1 + ratio;
      }

      this.zoomTo(imageData.width * ratio / imageData.naturalWidth, hasTooltip, _originalEvent);

      return this;
    },


    /**
     * Zoom the image to an absolute ratio.
     * @param {number} ratio - The target ratio.
     * @param {boolean} [hasTooltip=false] - Indicates if it has a tooltip or not.
     * @param {Event} [_originalEvent=null] - The original event if any.
     * @param {Event} [_zoomable=false] - Indicates if the current zoom is available or not.
     * @returns {Viewer} this
     */
    zoomTo: function zoomTo(ratio) {
      var hasTooltip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var _originalEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var _zoomable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var options = this.options,
          pointers = this.pointers,
          imageData = this.imageData;


      ratio = Math.max(0, ratio);

      if (isNumber(ratio) && this.viewed && !this.played && (_zoomable || options.zoomable)) {
        if (!_zoomable) {
          var minZoomRatio = Math.max(0.01, options.minZoomRatio);
          var maxZoomRatio = Math.min(100, options.maxZoomRatio);

          ratio = Math.min(Math.max(ratio, minZoomRatio), maxZoomRatio);
        }

        if (_originalEvent && ratio > 0.95 && ratio < 1.05) {
          ratio = 1;
        }

        var newWidth = imageData.naturalWidth * ratio;
        var newHeight = imageData.naturalHeight * ratio;

        if (_originalEvent) {
          var offset = getOffset(this.viewer);
          var center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
            pageX: _originalEvent.pageX,
            pageY: _originalEvent.pageY
          };

          // Zoom from the triggering point of the event
          imageData.left -= (newWidth - imageData.width) * ((center.pageX - offset.left - imageData.left) / imageData.width);
          imageData.top -= (newHeight - imageData.height) * ((center.pageY - offset.top - imageData.top) / imageData.height);
        } else {
          // Zoom from the center of the image
          imageData.left -= (newWidth - imageData.width) / 2;
          imageData.top -= (newHeight - imageData.height) / 2;
        }

        imageData.width = newWidth;
        imageData.height = newHeight;
        imageData.ratio = ratio;
        this.renderImage();

        if (hasTooltip) {
          this.tooltip();
        }
      }

      return this;
    },


    /**
     * Rotate the image with a relative degree.
     * @param {number} degree - The rotate degree.
     * @returns {Viewer} this
     */
    rotate: function rotate(degree) {
      this.rotateTo((this.imageData.rotate || 0) + Number(degree));

      return this;
    },


    /**
     * Rotate the image to an absolute degree.
     * @param {number} degree - The rotate degree.
     * @returns {Viewer} this
     */
    rotateTo: function rotateTo(degree) {
      var imageData = this.imageData;


      degree = Number(degree);

      if (isNumber(degree) && this.viewed && !this.played && this.options.rotatable) {
        imageData.rotate = degree;
        this.renderImage();
      }

      return this;
    },


    /**
     * Scale the image on the x-axis.
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @returns {Viewer} this
     */
    scaleX: function scaleX(_scaleX) {
      this.scale(_scaleX, this.imageData.scaleY);

      return this;
    },


    /**
     * Scale the image on the y-axis.
     * @param {number} scaleY - The scale ratio on the y-axis.
     * @returns {Viewer} this
     */
    scaleY: function scaleY(_scaleY) {
      this.scale(this.imageData.scaleX, _scaleY);

      return this;
    },


    /**
     * Scale the image.
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
     * @returns {Viewer} this
     */
    scale: function scale(scaleX) {
      var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scaleX;
      var imageData = this.imageData;


      scaleX = Number(scaleX);
      scaleY = Number(scaleY);

      if (this.viewed && !this.played && this.options.scalable) {
        var changed = false;

        if (isNumber(scaleX)) {
          imageData.scaleX = scaleX;
          changed = true;
        }

        if (isNumber(scaleY)) {
          imageData.scaleY = scaleY;
          changed = true;
        }

        if (changed) {
          this.renderImage();
        }
      }

      return this;
    },


    /**
     * Play the images
     * @param {boolean} [fullscreen=false] - Indicate if request fullscreen or not.
     * @returns {Viewer} this
     */
    play: function play() {
      var _this2 = this;

      var fullscreen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!this.isShown || this.played) {
        return this;
      }

      var options = this.options,
          player = this.player;

      var onLoad = this.loadImage.bind(this);
      var list = [];
      var total = 0;
      var index = 0;

      this.played = true;
      this.onLoadWhenPlay = onLoad;

      if (fullscreen) {
        this.requestFullscreen();
      }

      addClass(player, CLASS_SHOW);
      forEach(this.items, function (item, i) {
        var img = item.querySelector('img');
        var image = document.createElement('img');

        image.src = getData(img, 'originalUrl');
        image.alt = img.getAttribute('alt');
        total += 1;
        addClass(image, CLASS_FADE);
        toggleClass(image, CLASS_TRANSITION, options.transition);

        if (hasClass(item, CLASS_ACTIVE)) {
          addClass(image, CLASS_IN);
          index = i;
        }

        list.push(image);
        addListener(image, EVENT_LOAD, onLoad, {
          once: true
        });
        player.appendChild(image);
      });

      if (isNumber(options.interval) && options.interval > 0) {
        var play = function play() {
          _this2.playing = setTimeout(function () {
            removeClass(list[index], CLASS_IN);
            index += 1;
            index = index < total ? index : 0;
            addClass(list[index], CLASS_IN);
            play();
          }, options.interval);
        };

        if (total > 1) {
          play();
        }
      }

      return this;
    },


    // Stop play
    stop: function stop() {
      var _this3 = this;

      if (!this.played) {
        return this;
      }

      var player = this.player;


      this.played = false;
      clearTimeout(this.playing);
      forEach(player.getElementsByTagName('img'), function (image) {
        removeListener(image, EVENT_LOAD, _this3.onLoadWhenPlay);
      });
      removeClass(player, CLASS_SHOW);
      player.innerHTML = '';
      this.exitFullscreen();

      return this;
    },


    // Enter modal mode (only available in inline mode)
    full: function full() {
      var _this4 = this;

      var options = this.options,
          viewer = this.viewer,
          image = this.image,
          list = this.list;


      if (!this.isShown || this.played || this.fulled || !options.inline) {
        return this;
      }

      this.fulled = true;
      this.open();
      addClass(this.button, CLASS_FULLSCREEN_EXIT);

      if (options.transition) {
        removeClass(list, CLASS_TRANSITION);

        if (this.viewed) {
          removeClass(image, CLASS_TRANSITION);
        }
      }

      addClass(viewer, CLASS_FIXED);
      viewer.setAttribute('style', '');
      setStyle(viewer, {
        zIndex: options.zIndex
      });

      this.initContainer();
      this.viewerData = assign({}, this.containerData);
      this.renderList();

      if (this.viewed) {
        this.initImage(function () {
          _this4.renderImage(function () {
            if (options.transition) {
              setTimeout(function () {
                addClass(image, CLASS_TRANSITION);
                addClass(list, CLASS_TRANSITION);
              }, 0);
            }
          });
        });
      }

      return this;
    },


    download: function download(src) {
      var a = document.createElement('a');
      a.setAttribute('href', src);
      a.setAttribute('download', '');

      var evObj = document.createEvent('MouseEvents');
      evObj.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);
      a.dispatchEvent(evObj);
    },

    // Exit modal mode (only available in inline mode)
    exit: function exit() {
      var _this5 = this;

      var options = this.options,
          viewer = this.viewer,
          image = this.image,
          list = this.list;


      if (!this.isShown || this.played || !this.fulled || !options.inline) {
        return this;
      }

      this.fulled = false;
      this.close();
      removeClass(this.button, CLASS_FULLSCREEN_EXIT);

      if (options.transition) {
        removeClass(list, CLASS_TRANSITION);

        if (this.viewed) {
          removeClass(image, CLASS_TRANSITION);
        }
      }

      removeClass(viewer, CLASS_FIXED);
      setStyle(viewer, {
        zIndex: options.zIndexInline
      });

      this.viewerData = assign({}, this.parentData);
      this.renderViewer();
      this.renderList();

      if (this.viewed) {
        this.initImage(function () {
          _this5.renderImage(function () {
            if (options.transition) {
              setTimeout(function () {
                addClass(image, CLASS_TRANSITION);
                addClass(list, CLASS_TRANSITION);
              }, 0);
            }
          });
        });
      }

      return this;
    },


    // Show the current ratio of the image with percentage
    tooltip: function tooltip() {
      var _this6 = this;

      var options = this.options,
          tooltipBox = this.tooltipBox,
          imageData = this.imageData;


      if (!this.viewed || this.played || !options.tooltip) {
        return this;
      }

      tooltipBox.textContent = Math.round(imageData.ratio * 100) + '%';

      if (!this.tooltipping) {
        if (options.transition) {
          if (this.fading) {
            dispatchEvent(tooltipBox, EVENT_TRANSITION_END);
          }

          addClass(tooltipBox, CLASS_SHOW);
          addClass(tooltipBox, CLASS_FADE);
          addClass(tooltipBox, CLASS_TRANSITION);

          // Force reflow to enable CSS3 transition
          // eslint-disable-next-line
          tooltipBox.offsetWidth;
          addClass(tooltipBox, CLASS_IN);
        } else {
          addClass(tooltipBox, CLASS_SHOW);
        }
      } else {
        clearTimeout(this.tooltipping);
      }

      this.tooltipping = setTimeout(function () {
        if (options.transition) {
          addListener(tooltipBox, EVENT_TRANSITION_END, function () {
            removeClass(tooltipBox, CLASS_SHOW);
            removeClass(tooltipBox, CLASS_FADE);
            removeClass(tooltipBox, CLASS_TRANSITION);
            _this6.fading = false;
          }, {
            once: true
          });

          removeClass(tooltipBox, CLASS_IN);
          _this6.fading = true;
        } else {
          removeClass(tooltipBox, CLASS_SHOW);
        }

        _this6.tooltipping = false;
      }, 1000);

      return this;
    },


    // Toggle the image size between its natural size and initial size
    toggle: function toggle() {
      if (this.imageData.ratio === 1) {
        this.zoomTo(this.initialImageData.ratio, true);
      } else {
        this.zoomTo(1, true);
      }

      return this;
    },


    // Reset the image to its initial state
    reset: function reset() {
      if (this.viewed && !this.played) {
        this.imageData = assign({}, this.initialImageData);
        this.renderImage();
      }

      return this;
    },


    // Update viewer when images changed
    update: function update() {
      var element = this.element,
          options = this.options,
          isImg = this.isImg;

      // Destroy viewer if the target image was deleted

      if (isImg && !element.parentNode) {
        return this.destroy();
      }

      var images = [];

      forEach(isImg ? [element] : element.querySelectorAll('img'), function (image) {
        if (options.filter) {
          if (options.filter(image)) {
            images.push(image);
          }
        } else {
          images.push(image);
        }
      });

      if (!images.length) {
        return this;
      }

      this.images = images;
      this.length = images.length;

      if (this.ready) {
        var indexes = [];

        forEach(this.items, function (item, i) {
          var img = item.querySelector('img');
          var image = images[i];

          if (image) {
            if (image.src !== img.src) {
              indexes.push(i);
            }
          } else {
            indexes.push(i);
          }
        });

        setStyle(this.list, {
          width: 'auto'
        });

        this.initList();

        if (this.isShown) {
          if (this.length) {
            if (this.viewed) {
              var index = indexes.indexOf(this.index);

              if (index >= 0) {
                this.viewed = false;
                this.view(Math.max(this.index - (index + 1), 0));
              } else {
                addClass(this.items[this.index], CLASS_ACTIVE);
              }
            }
          } else {
            this.image = null;
            this.viewed = false;
            this.index = 0;
            this.imageData = {};
            this.canvas.innerHTML = '';
            this.title.innerHTML = '';
          }
        }
      } else {
        this.build();
      }

      return this;
    },


    // Destroy the viewer
    destroy: function destroy() {
      var element = this.element,
          options = this.options;


      if (!getData(element, NAMESPACE)) {
        return this;
      }

      this.destroyed = true;

      if (this.ready) {
        if (this.played) {
          this.stop();
        }

        if (options.inline) {
          if (this.fulled) {
            this.exit();
          }

          this.unbind();
        } else if (this.isShown) {
          if (this.viewing) {
            if (this.imageRendering) {
              this.imageRendering.abort();
            } else if (this.imageInitializing) {
              this.imageInitializing.abort();
            }
          }

          if (this.hiding) {
            this.transitioning.abort();
          }

          this.hidden();
        } else if (this.showing) {
          this.transitioning.abort();
          this.hidden();
        }

        this.ready = false;
        this.viewer.parentNode.removeChild(this.viewer);
      } else if (options.inline) {
        if (this.delaying) {
          this.delaying.abort();
        } else if (this.initializing) {
          this.initializing.abort();
        }
      }

      if (!options.inline) {
        removeListener(element, EVENT_CLICK, this.onStart);
      }

      removeData(element, NAMESPACE);
      return this;
    }
  };

  var others = {
    open: function open() {
      var body = this.body;


      addClass(body, CLASS_OPEN);

      body.style.paddingRight = this.scrollbarWidth + (parseFloat(this.initialBodyPaddingRight) || 0) + 'px';
    },
    close: function close() {
      var body = this.body;


      removeClass(body, CLASS_OPEN);
      body.style.paddingRight = this.initialBodyPaddingRight;
    },
    shown: function shown() {
      var element = this.element,
          options = this.options;


      this.fulled = true;
      this.isShown = true;
      this.render();
      this.bind();
      this.showing = false;

      if (isFunction(options.shown)) {
        addListener(element, EVENT_SHOWN, options.shown, {
          once: true
        });
      }

      if (dispatchEvent(element, EVENT_SHOWN) === false) {
        return;
      }

      if (this.ready && this.isShown && !this.hiding) {
        this.view(this.index);
      }
    },
    hidden: function hidden() {
      var element = this.element,
          options = this.options;


      this.fulled = false;
      this.viewed = false;
      this.isShown = false;
      this.close();
      this.unbind();
      addClass(this.viewer, CLASS_HIDE);
      this.resetList();
      this.resetImage();
      this.hiding = false;

      if (!this.destroyed) {
        if (isFunction(options.hidden)) {
          addListener(element, EVENT_HIDDEN, options.hidden, {
            once: true
          });
        }

        dispatchEvent(element, EVENT_HIDDEN);
      }
    },
    requestFullscreen: function requestFullscreen() {
      var document = this.element.ownerDocument;

      if (this.fulled && !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        var documentElement = document.documentElement;


        if (documentElement.requestFullscreen) {
          documentElement.requestFullscreen();
        } else if (documentElement.msRequestFullscreen) {
          documentElement.msRequestFullscreen();
        } else if (documentElement.mozRequestFullScreen) {
          documentElement.mozRequestFullScreen();
        } else if (documentElement.webkitRequestFullscreen) {
          documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      }
    },
    exitFullscreen: function exitFullscreen() {
      if (this.fulled) {
        var document = this.element.ownerDocument;

        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    },
    change: function change(e) {
      var options = this.options,
          pointers = this.pointers;

      var pointer = pointers[Object.keys(pointers)[0]];
      var offsetX = pointer.endX - pointer.startX;
      var offsetY = pointer.endY - pointer.startY;

      switch (this.action) {
        // Move the current image
        case ACTION_MOVE:
          this.move(offsetX, offsetY);
          break;

        // Zoom the current image
        case ACTION_ZOOM:
          this.zoom(getMaxZoomRatio(pointers), false, e);
          break;

        case ACTION_SWITCH:
          this.action = 'switched';

          // Empty `pointers` as `touchend` event will not be fired after swiped in iOS browsers.
          this.pointers = {};

          if (Math.abs(offsetX) > Math.abs(offsetY)) {
            if (offsetX > 1) {
              this.prev(options.loop);
            } else if (offsetX < -1) {
              this.next(options.loop);
            }
          }

          break;

        default:
      }

      // Override
      forEach(pointers, function (p) {
        p.startX = p.endX;
        p.startY = p.endY;
      });
    },
    isSwitchable: function isSwitchable() {
      var imageData = this.imageData,
          viewerData = this.viewerData;


      return this.length > 1 && imageData.left >= 0 && imageData.top >= 0 && imageData.width <= viewerData.width && imageData.height <= viewerData.height;
    }
  };

  var AnotherViewer = WINDOW.Viewer;

  var Viewer = function () {
    /**
     * Create a new Viewer.
     * @param {Element} element - The target element for viewing.
     * @param {Object} [options={}] - The configuration options.
     */
    function Viewer(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, Viewer);

      if (!element || element.nodeType !== 1) {
        throw new Error('The first argument is required and must be an element.');
      }

      this.element = element;
      this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
      this.action = false;
      this.fading = false;
      this.fulled = false;
      this.hiding = false;
      this.imageData = {};
      this.index = 0;
      this.isImg = false;
      this.isShown = false;
      this.length = 0;
      this.played = false;
      this.playing = false;
      this.pointers = {};
      this.ready = false;
      this.showing = false;
      this.timeout = false;
      this.tooltipping = false;
      this.viewed = false;
      this.viewing = false;
      this.wheeling = false;
      this.init();
    }

    createClass(Viewer, [{
      key: 'init',
      value: function init() {
        var _this = this;

        var element = this.element,
            options = this.options;


        if (getData(element, NAMESPACE)) {
          return;
        }

        setData(element, NAMESPACE, this);

        var isImg = element.tagName.toLowerCase() === 'img';
        var images = [];

        forEach(isImg ? [element] : element.querySelectorAll('img'), function (image) {
          if (isFunction(options.filter)) {
            if (options.filter.call(_this, image)) {
              images.push(image);
            }
          } else {
            images.push(image);
          }
        });

        if (!images.length) {
          return;
        }

        this.isImg = isImg;
        this.length = images.length;
        this.images = images;

        var ownerDocument = element.ownerDocument;

        var body = ownerDocument.body || ownerDocument.documentElement;

        this.body = body;
        this.scrollbarWidth = window.innerWidth - ownerDocument.documentElement.clientWidth;
        this.initialBodyPaddingRight = window.getComputedStyle(body).paddingRight;

        // Override `transition` option if it is not supported
        if (isUndefined(document.createElement(NAMESPACE).style.transition)) {
          options.transition = false;
        }

        if (options.inline) {
          var count = 0;
          var progress = function progress() {
            count += 1;

            if (count === _this.length) {
              var timeout = void 0;

              _this.initializing = false;
              _this.delaying = {
                abort: function abort() {
                  clearTimeout(timeout);
                }
              };

              // build asynchronously to keep `this.viewer` is accessible in `ready` event handler.
              timeout = setTimeout(function () {
                _this.delaying = false;
                _this.build();
              }, 0);
            }
          };

          this.initializing = {
            abort: function abort() {
              forEach(images, function (image) {
                if (!image.complete) {
                  removeListener(image, EVENT_LOAD, progress);
                }
              });
            }
          };

          forEach(images, function (image) {
            if (image.complete) {
              progress();
            } else {
              addListener(image, EVENT_LOAD, progress, {
                once: true
              });
            }
          });
        } else {
          addListener(element, EVENT_CLICK, this.onStart = function (_ref) {
            var target = _ref.target;

            if (target.tagName.toLowerCase() === 'img') {
              _this.view(_this.images.indexOf(target));
            }
          });
        }
      }
    }, {
      key: 'build',
      value: function build() {
        if (this.ready) {
          return;
        }

        var element = this.element,
            options = this.options;

        var parent = element.parentNode;
        var template = document.createElement('div');

        template.innerHTML = TEMPLATE;

        var viewer = template.querySelector('.' + NAMESPACE + '-container');
        var title = viewer.querySelector('.' + NAMESPACE + '-title');
        var toolbar = viewer.querySelector('.' + NAMESPACE + '-toolbar');
        var navbar = viewer.querySelector('.' + NAMESPACE + '-navbar');
        var button = viewer.querySelector('.' + NAMESPACE + '-button');
        var canvas = viewer.querySelector('.' + NAMESPACE + '-canvas');

        this.parent = parent;
        this.viewer = viewer;
        this.title = title;
        this.toolbar = toolbar;
        this.navbar = navbar;
        this.button = button;
        this.canvas = canvas;
        this.footer = viewer.querySelector('.' + NAMESPACE + '-footer');
        this.tooltipBox = viewer.querySelector('.' + NAMESPACE + '-tooltip');
        this.player = viewer.querySelector('.' + NAMESPACE + '-player');
        this.list = viewer.querySelector('.' + NAMESPACE + '-list');

        addClass(title, !options.title ? CLASS_HIDE : getResponsiveClass(options.title));
        addClass(navbar, !options.navbar ? CLASS_HIDE : getResponsiveClass(options.navbar));
        toggleClass(button, CLASS_HIDE, !options.button);

        if (options.backdrop) {
          addClass(viewer, NAMESPACE + '-backdrop');

          if (!options.inline && options.backdrop === true) {
            setData(canvas, DATA_ACTION, 'hide');
          }
        }

        if (options.toolbar) {
          var list = document.createElement('ul');
          var custom = isPlainObject(options.toolbar);
          var zoomButtons = BUTTONS.slice(0, 3);
          var rotateButtons = BUTTONS.slice(7, 9);
          var scaleButtons = BUTTONS.slice(9);

          if (!custom) {
            addClass(toolbar, getResponsiveClass(options.toolbar));
          }

          forEach(custom ? options.toolbar : BUTTONS, function (value, index) {
            var deep = custom && isPlainObject(value);
            var name = custom ? hyphenate(index) : value;
            var show = deep && !isUndefined(value.show) ? value.show : value;

            if (!show || !options.zoomable && zoomButtons.indexOf(name) !== -1 || !options.rotatable && rotateButtons.indexOf(name) !== -1 || !options.scalable && scaleButtons.indexOf(name) !== -1) {
              return;
            }

            var size = deep && !isUndefined(value.size) ? value.size : value;
            var click = deep && !isUndefined(value.click) ? value.click : value;
            var item = document.createElement('li');

            item.setAttribute('role', 'button');
            addClass(item, NAMESPACE + '-' + name);

            if (!isFunction(click)) {
              setData(item, DATA_ACTION, name);
            }

            if (isNumber(show)) {
              addClass(item, getResponsiveClass(show));
            }

            if (['small', 'large'].indexOf(size) !== -1) {
              addClass(item, NAMESPACE + '-' + size);
            } else if (name === 'play') {
              addClass(item, NAMESPACE + '-large');
            }

            if (isFunction(click)) {
              addListener(item, EVENT_CLICK, click);
            }

            list.appendChild(item);
          });

          toolbar.appendChild(list);
        } else {
          addClass(toolbar, CLASS_HIDE);
        }

        if (!options.rotatable) {
          var rotates = toolbar.querySelectorAll('li[class*="rotate"]');

          addClass(rotates, CLASS_INVISIBLE);
          forEach(rotates, function (rotate) {
            toolbar.appendChild(rotate);
          });
        }

        if (options.inline) {
          addClass(button, CLASS_FULLSCREEN);
          setStyle(viewer, {
            zIndex: options.zIndexInline
          });

          if (window.getComputedStyle(parent).position === 'static') {
            setStyle(parent, {
              position: 'relative'
            });
          }

          parent.insertBefore(viewer, element.nextSibling);
        } else {
          addClass(button, CLASS_CLOSE);
          addClass(viewer, CLASS_FIXED);
          addClass(viewer, CLASS_FADE);
          addClass(viewer, CLASS_HIDE);

          setStyle(viewer, {
            zIndex: options.zIndex
          });

          var container = options.container;


          if (isString(container)) {
            container = element.ownerDocument.querySelector(container);
          }

          if (!container) {
            container = this.body;
          }

          container.appendChild(viewer);
        }

        if (options.inline) {
          this.render();
          this.bind();
          this.isShown = true;
        }

        this.ready = true;

        if (isFunction(options.ready)) {
          addListener(element, EVENT_READY, options.ready, {
            once: true
          });
        }

        if (dispatchEvent(element, EVENT_READY) === false) {
          this.ready = false;
          return;
        }

        if (this.ready && options.inline) {
          this.view();
        }
      }

      /**
       * Get the no conflict viewer class.
       * @returns {Viewer} The viewer class.
       */

    }], [{
      key: 'noConflict',
      value: function noConflict() {
        window.Viewer = AnotherViewer;
        return Viewer;
      }

      /**
       * Change the default options.
       * @param {Object} options - The new default options.
       */

    }, {
      key: 'setDefaults',
      value: function setDefaults(options) {
        assign(DEFAULTS, isPlainObject(options) && options);
      }
    }]);
    return Viewer;
  }();

  assign(Viewer.prototype, render, events, handlers, methods, others);

  return Viewer;

})));
