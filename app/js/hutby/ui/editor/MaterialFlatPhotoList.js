/**
 * Created by aliaksei on 28/12/15.
 */

define([
    'div'
], function(
    Div
    ){

    function Photo(photo) {
        var _this = new Div('demo-card-image').class('mdl-cell').class('mdl-card').class('mdl-cell--4-col').class('mdl-shadow--2dp');

        _this.initialize = function(){
            _this.css("background","url('"+photo.thumbnail().path()+"') center / cover");
        };

        _this.initialize();

        return _this;
    }

    function MaterialFlatPhotoList(flat){
        var _this = new Div().class('demo-charts').class('mdl-cell').class('mdl-cell--12-col').class('mdl-grid');

        _this.initialize = function(){
            _this.addPhotos();
            _this.sortable({
                revert: 100,
                zIndex: 9999,
                distance: 5
            });
        };

        _this.addPhotos = function() {
            _.each(flat.photos(), function(photo){
                _this.add(new Photo(photo));
            })
        };

        _this.initialize();

        return _this;
    }

    return MaterialFlatPhotoList;

});