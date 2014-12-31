/**
 * Created by aliaksei on 03/08/14.
 */

"use strict";
define([
    'hutby/main/PagerViewHolder',
    'hutby/lib/Utils',
    'hutby/lib/WindowEvents',
    'hutby/announcements/OnFlatExpanded',
    'hutby/announcements/OnCategoryExpanded',
    'hutby/announcements/OnCategoryCollapsed',
    'hutby/common/Global',
    'hutby/ui/PagerLeftArrow',
    'hutby/ui/PagerRightArrow',
    'hutby/ui/PagerPhoto',
    'jquery',
    'jquery.animo'
], function(
    PagerViewHolder,
    Utils,
    WindowEvents,
    OnFlatExpanded,
    OnCategoryExpanded,
    OnCategoryCollapsed,
    Global,
    PagerLeftArrow,
    PagerRightArrow,
    PagerPhoto,
    $){

    function Pager (catalog, prefix) {
        var _this = $('<div class="hutby-flat-pager-container"></div>');

        var pagerHideEffect = 'zoomOutLeft';
        var pagerShowEffect = 'zoomInLeft';
        var pagerSwapEffect = 'fadeIn';

        var pagerHideSpeed = 0.75;
        var pagerShowSpeed = 0.75;

        var timeout = 5000;
        var defaultSpeed = 0.5;

        var holder = new PagerViewHolder(prefix);

        var currentIndex = 0;
        var currentSpeed;

        var leftArrow = new PagerLeftArrow();
        var rightArrow = new PagerRightArrow();
        var photo = new PagerPhoto();

        var flats = catalog.allFlats();
        var timer;
        var isWasVisible; //initialize later
        var block = false;

        _this.initialize = function () {
            catalog.announcer().onSendTo(OnCategoryExpanded, _this.onCategoryExpanded, _this);
            catalog.announcer().onSendTo(OnCategoryCollapsed, _this.onCategoryCollapsed, _this);
            photo.setPhoto(_this.currentFlat().getPhoto(0));
        };

        _this.onCategoryExpanded = function () {
            _this.hidePager();
        };

        _this.onCategoryCollapsed = function () {
            _this.showPager();
        };

        _this.setFlats = function (_flats) {
            flats = _flats;
        };

        _this.setSpeed = function(_speed) {
            currentSpeed = _speed;
        };

        _this.swap = function() {

            function loop() {
                if (!_this.isVisible()) return;
                _this.setSpeed(defaultSpeed);

                _this.nextFlat(function() {
                    timer = setTimeout(loop, timeout);
                });
            }

            _this.stopSwapping();
            timer = setTimeout(loop, timeout);
        };

        _this.swapImage = function(_imagePath, _callback) {

            var newPhoto = _this.buildNextPhoto(_imagePath);
            photo.after(newPhoto);
            newPhoto.animo({ animation: pagerSwapEffect, duration: currentSpeed }, function() {
                photo.setPhoto(_imagePath);
                newPhoto.remove();
                _callback()
            });
        };

        _this.swapFlatTo = function(_index, _callback) {
            if (block) return;
            block = true;

            if (_index >= flats.length) _index = 0;
            if (_index < 0) _index = flats.length - 1;

            Utils.imagePreload(flats[_index].getPhoto(0), function() {

                _this.swapImage(flats[_index].getPhoto(0), function() {
                    holder.address().html(flats[_index].getAddress());
                    currentIndex = _index;
                    block = false;
                    _callback();
                });
            });
        };

        _this.hidePager = function () {
            _this.stopSwapping();
            var duration = Global.isDisplaySmall() ? 0 : pagerHideSpeed;

            _this.animoStop();
            _this.animo( { animation: pagerHideEffect, duration: duration }, function() {
                _this.hide(0);
                _this.updateVisibility();
            });
        };

        _this.showPager = function () {
            if (Global.isDisplaySmall()) return;
            _this.createPager();

            _this.animoStop();
            _this.show(0).animo({ animation: pagerShowEffect, duration: pagerShowSpeed }, function(){
                _this.updateVisibility();
                _this.swap();
            });
        };

        _this.nextFlat = function (_callback) {
            _this.swapFlatTo(currentIndex + 1, _callback);
        };

        _this.previousFlat = function (_callback) {
            _this.swapFlatTo(currentIndex - 1, _callback);
        };

        _this.currentFlat = function () {
            return flats[currentIndex];
        };

        _this.stopSwapping = function(){
            clearTimeout(timer);
        };

        _this.leftArrowClick = function () {
            _this.stopSwapping();
            _this.setSpeed(0);
            _this.previousFlat(function(){
                _this.swap();
            })
        };

        _this.rightArrowClick = function(){
            _this.stopSwapping();
            _this.setSpeed(0);
            _this.nextFlat(function(){
                _this.swap();
            })
        };

        _this.windowOnResize = function(){
            var isVisible = _this.isVisible();
            if (isWasVisible != isVisible) {
                if (isVisible) _this.swap();
                else _this.stopSwapping();
                isWasVisible = isVisible;
            }
        };

        _this.isVisible = function() {
            return _this.is(':visible');
        };

        _this.updateVisibility = function () {
            isWasVisible = _this.isVisible();
        };

        _this.buildNextPhoto = function(imagePath) {
            var nextPhoto = new PagerPhoto();
            nextPhoto.beActive();
            nextPhoto.setPhoto(imagePath);
            return nextPhoto;
        };

        _this.initializeEvents = function () {
            _this.updateVisibility();
            leftArrow.click(_this.leftArrowClick);
            rightArrow.click(_this.rightArrowClick);
            WindowEvents.addOnResizeEvent(_this.windowOnResize);

            holder.address().html(flats[currentIndex].getAddress());
            holder.address().click(function(e){
                e.preventDefault();
                _this.currentFlat().expand(false, true);
            });

            _this.swap();
        };

        _this.createPager = function () {
            if (Utils.isUndefined(holder.address())) {
                _this.append(photo);
                _this.append($(_this.buildPager(catalog.allFlats()[currentIndex])));
                _this.append(leftArrow);
                _this.append(rightArrow);
                _this.initializeEvents();
            }
        };

        _this.buildPager = function(flat) {
            return  '<div class="hutby-flat-pager-short-info-container">'+
                        '<a class="hutby-flat-pager-short-info-phone" href="tel:+375293990099"></a>'+
                        '<a id="hutby-flat-pager-address" class="hutby-flat-pager-short-info-address" href="#" class="">'+flat.getAddress()+'</a>'+
                    '</div>'+

                    '<div class="text-center hutby-flat-pager-slogan-container">'+
                        '<p>в Минске</p>'+
                        '<p>в центре</p>'+
                        '<p>у метро</p>'+
                    '</div>';
        };

        /////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////// I N I T ////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////
        _this.initialize();
        return _this;
    }

    return Pager;
});