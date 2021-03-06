/**
 * Created by aliaksei on 03/08/14.
 */
define ([
    'config',
    'hutby/common/Flat',
    'dictionary',
    'hutby/announcements/OnFlatExpanded',
    'hutby/announcements/OnFlatCollapsed',
    'hutby/announcements/OnFlatAdded',
    'hutby/announcements/OnFlatRemoved',
    'hutby/announcements/OnCategoryExpanded',
    'hutby/announcements/OnCategoryCollapsed',
    'hutby/announcements/OnCategoryPreviewShow',
    'hutby/announcements/OnCategoryPreviewHide',
    'hutby/announcements/OnMediaSizeChanged',
    'announcer'

], function(
    Config,
    Flat,
    Dictionary,
    OnFlatExpanded,
    OnFlatCollapsed,
    OnFlatAdded,
    OnFlatRemoved,
    OnCategoryExpanded,
    OnCategoryCollapsed,
    OnCategoryPreviewShow,
    OnCategoryPreviewHide,
    OnMediaSizeChanged,
    Announcer
){

    function Catalog(optConfig) {
        var _this = this;

        var flats = new Dictionary();
        var announcer = new Announcer();
        var count = 0;

        var expandedCategory = null;
        var expandedFlat = null;

        _this.initialize = function() {
            if (!_.isUndefined(optConfig)) {
                _.each(optConfig, function(flatConfig){
                    _this.addFlat(new Flat(flatConfig));
                });
            }
        };

        _this.addFlat = function (flat) {
            if (!flats.isKeyExists(flat.getRooms())) {
                flats.put(flat.getRooms(), []);
            }

            flats.get(flat.getRooms()).push(flat);
            flat.setCatalog(_this);
            count++;
        };

        _this.flats = function (rooms) {
            return flats.get(rooms);
        };

        _this.allFlats = function (){
            var array = [];
            flats.each(function(key,value){
                array = array.concat(value);
            });
            return array;
        };

        _this.possibleRooms = function () {
            return flats.keys();
        };

        _this.onFlatExpanded = function(ann) {
            var theSame = _this.expandedFlat() === ann.flat();
            if(_this.isFlatExpanded()) {
                if (!theSame)
                    _this.expandedFlat().collapse();
            }
            expandedFlat = ann.flat();
            if (!_this.isCategoryExpanded() || _this.expandedCategory() !== ann.flat().getRooms()) {
                _this.expandCategory(ann.flat().getRooms(), _this.isCategoryExpanded(), false);
            }
            if (!theSame) _this.announcer().announce(ann);
        };

        _this.onFlatCollapsed = function(ann) {
            expandedFlat = null;
            _this.announcer().announce(ann);
        };

        _this.expandedCategory = function () {
            return expandedCategory;
        };

        _this.expandedFlat = function () {
            return expandedFlat;
        };

        /**
         * Tests if any flat is expanded.
         * @returns {boolean} - true if flat is expanded. Otherwise false
         */
        _this.isFlatExpanded = function () {
            return !_.isNull(_this.expandedFlat());
        };

        _this.isCategoryExpanded = function () {
            return !_.isNull(_this.expandedCategory());
        };

        _this.collapseCategory = function (animated) {
            var category = expandedCategory;
            expandedCategory = null;
            _this.announcer().announce(new OnCategoryCollapsed(category, animated));
        };

        _this.collapseFlat = function (animated) {
            animated = _.isUndefined(animated) ? false : animated;
            if (!_this.isFlatExpanded()) return;
            _this.expandedFlat().collapse(animated);
        };

        _this.expandCategory = function (rooms, animated, expandFlat) {
            expandFlat = _.isUndefined(expandFlat) ? true : expandFlat;
            if (_this.expandedCategory() !== rooms) {
                expandedCategory = rooms;
                if (expandFlat)
                    _this.flats(_this.expandedCategory())[0].expand(animated);
                _this.announcer().announce(new OnCategoryExpanded(rooms, animated));
            }
        };

        _this.newFlat = function(){
            var flat = new Flat();
            flat.address('Новая квартира');
            _this.addFlat(flat);
            _this.notifyFlatAdded(flat);
            return flat;
        };

        _this.removeFlat = function(flat) {
            if (count == 0) return;
            flat.collapse();
            var array = [];
            if (flats.isKeyExists(flat.getRooms())) {
                array = flats.get(flat.getRooms());
            }
            for(var i = array.length - 1; i >= 0; i--) {
                if(array[i] === flat) {
                    array.splice(i, 1);
                }
            }
            if (array.length == 0)
                flats.remove(flat.getRooms());
            flat.setCatalog(null);
            count--;
            _this.notifyFlatRemoved(flat);
        };

        _this.reorder = function(_flats) {
            flats = new Dictionary();
            _.each(_flats, function(flat){
                if (!flats.isKeyExists(flat.getRooms())) {
                    flats.put(flat.getRooms(), []);
                }
                flats.get(flat.getRooms()).push(flat);
            });
        };

        /**
         * Notifies all listeners that it is necessary to show category preview
         * @param rooms - category preview to show
         * @param anchor - an anchor element, that should be used to position preview
         */
        _this.showCategoryPreview = function (rooms, anchor) {
            if (!Config.showCategoryPreview) return;
            _this.announcer().announce(new OnCategoryPreviewShow(rooms, anchor));
        };

        _this.hideCategoryPreview = function (rooms, anchor) {
            if (!Config.showCategoryPreview) return;
            _this.announcer().announce(new OnCategoryPreviewHide(rooms, anchor));
        };

        _this.notifyFlatAdded = function(flat) {
            _this.announcer().announce(new OnFlatAdded(flat));
        };

        _this.notifyFlatRemoved = function(flat) {
            _this.announcer().announce(new OnFlatRemoved(flat));
        };

        _this.announcer = function(){
            return announcer;
        };

        _this.accept = function(visitor) {
            visitor.visitCatalog(_this);
            _.each(_.flatten(flats.elements()),  function(flat){flat.accept(visitor)});
        };

        _this.toJSON = function() {
            return _.map(_.flatten(flats.elements()), function(flat){
                return flat.toJSON();
            });
        };

        _this.initialize();
    }
    return Catalog;
});