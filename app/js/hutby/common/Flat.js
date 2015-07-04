/**
 * Created by aliaksei on 03/08/14.
 */
define([
    'dictionary',
    'announcer',
    'hutby/announcements/OnFlatExpanded',
    'hutby/announcements/OnFlatCollapsed',
    'hutby/lib/Utils',
    'hutby/common/Photo'
], function(
    Dictionary,
    Announcer,
    OnFlatExpanded,
    OnFlatCollapsed,
    Utils,
    Photo) {


    /**
     *
     * @param _config
     * @constructor
     * @class Price
     */
    function Price(_config) {
        var _this = this;

        var amount;
        var currency = '$';
        var special;

        /**
         * @param {Object} config
         * @param {int|String} config.amount
         * @param {String} config.currency
         * @param {String} config.special
         */
        _this.initialize = function(config) {
            amount = config.amount;
            currency = config.currency;
            special = config.special;
        };

        _this.amount = function () {
            return amount;
        };

        _this.currency = function () {
            return currency;
        };

        _this.special = function () {
            return special;
        };

        /**
         * Prints price in human readable format
         * @returns {String}
         */
        _this.printString = function () {
            return _this.amount() + _this.currency();
        };

        _this.initialize(_config);
    }

    /**
     * @param _config
     * @constructor
     * @class Overview
     */
    function Overview(_config) {
        var _this = this;

        var description = "";
        var features  = [];

        /**
         * @param {Object} config
         * @param {String} config.description
         * @param {Array} config.features
         */
        _this.initialize = function (config) {
            description = config.description;
            features = config.features;
        };

        /**
         * @returns {string}
         */
        _this.description = function () {
            return description;
        };

        /**
         * @returns {Array}
         */
        _this.features = function () {
            return features;
        };

        _this.initialize(_config);
    }

    function Specification() {
        var _this = this;

        var name;
        var description;
    }

    /**
     *
     * @param _config
     * @constructor
     * @class Flat
     */
    function Flat(_config) {
        var _this = this;

        var rooms;
        var address;
        var price;
        var overview;
        var specifications = new Dictionary();
        var photos = [];

        var catalog;
        var isExpanded = false;
        var announcer = new Announcer();
        /**
         *
         * @param {Object} config
         * @param {int} config.rooms
         * @param {String} config.title
         * @param {Array} config.photos
         * @param {String} config.address
         * @param {Object} config.price
         * @param {Object} config.overview
         */
        _this.initialize = function (config) {
            if (_.isUndefined(config)) return;
            rooms = config.rooms;
            address = config.address;
            price = new Price(config.price);
            overview = new Overview(config.overview);
            _.each(config.photos, _this.addPhoto);
        };

        /**
         * @returns {Array}
         */
        _this.photos = function () {
            return photos;
        };

        /**
         * Adds new photo to existing ones
         * @param {Object} photo
         */
        _this.addPhoto = function (photo) {
            photos.push(new Photo(photo));
        };

        /**
         * Returns photo at index
         * @param _index
         * @returns {Photo}
         */
        _this.photoAt = function(_index) {
            if (_index >= photos.length) return null;
            return photos[_index];
        };

        /**
         * Photo that should be used as title
         * @returns {Photo}
         */
        _this.titlePhoto = function () {
            return _this.photoAt(0);
        };

        /**
         * Setter/getter for price value
         * @returns {Price}
         */
        _this.price = function() {
            return price;
        };

        /**
         * Setter/getter for address
         * @param {String} [aString]
         * @returns {Flat|String}
         */
        _this.address = function (aString) {
            if (_.isUndefined(aString)) return address;
            address = aString;
            return _this;
        };

        _this.getLink = function() {
            return '#';
        };

        _this.printTitle = function () {
            return Utils.capitalizeFirstLetter(_this.roomsString()) + ' по ' + _this.address();
        };

        _this.setRooms = function (_rooms) {
            rooms = _rooms;
        };

        _this.getRooms = function () {
            return rooms;
        };

        _this.roomsString = function () {
            switch (_this.getRooms()) {
                case 1 : return 'однокомнатная';
                case 2 : return 'двухкомнатная';
                case 3 : return 'трехкомнатная';
                default : return 'многокомнатная';
            }
        };

        _this.getPhotosCount = function () {
            return photos.length;
        };

        /**
         * @returns {Overview}
         */
        _this.overview = function () {
            return overview;
        };

        _this.addSpecification = function(name, specification){
            specifications.put(name, specification);
        };

        _this.getSpecifications = function(){
            return specifications;
        };

        _this.announcer = function () {
            return announcer;
        };

        _this.isExpanded = function () {
            return isExpanded;
        };

        _this.setCatalog = function (_catalog) {
            catalog = _catalog;
        };

        _this.catalog = function () {
            return catalog;
        };

        /**
         * Collapses flat if and only if it is expanded. Notifies catalog
         * about collapsed flat.
         * @param isAnimated - true to use animation for collapsing
         */
        _this.collapse = function (isAnimated) {
            if (!_this.isExpanded()) return;
            isExpanded = false;
            var ann = new OnFlatCollapsed(_this, isAnimated);
            _this.catalog().onFlatCollapsed(ann);
            _this.announcer().announce(ann);
        };

        _this.expand = function (isAnimated, force) {
            var wasExpanded = _this.isExpanded();
            force = Utils.isUndefined(force) ? false : force;
            if (_this.isExpanded() && !force) return;
            isExpanded = true;
            var ann = new OnFlatExpanded(_this, isAnimated, true);
            _this.catalog().onFlatExpanded(ann);
            if (!wasExpanded)_this.announcer().announce(ann);
        };

        _this.initialize(_config);
    }

    Flat.Specification = function(_key, _value){
        this.key = _key;
        this.value = _value;
    };

    return Flat;
});