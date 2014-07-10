chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "kbb-port");
    var init = function(){

        port.postMessage({type:"popup"});

        port.onMessage.addListener(function(request) {
            var cars = []
            
            var Car = Backbone.Model.extend({
                defaults:{
                    img:"img/placeholder.gif",
                    make:"Honda",
                    model:"Civic",
                    year:"1994",
                    mileage:0
                }
            });

            var CarView = Backbone.View.extend({
                tagName:"div",
                className:"carContainer",
                template:$("#carTemplate").html(),

                render:function () {
                    var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html

                    this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
                    return this;
                }
            });

            var Library = Backbone.Collection.extend({
                model:Car
            });

            var LibraryView = Backbone.View.extend({
                el:$("#cars"),

                initialize:function(){
                    this.collection = new Library(cars);
                    this.render();
                },

                render: function(){
                    var that = this;
                    _.each(this.collection.models, function(item){
                        that.renderCar(item);
                    }, this);
                },

                renderCar:function(item){
                    var carView = new CarView({
                        model: item
                    });
                    this.$el.append(carView.render().el);
                }
            });

            var libraryView = new LibraryView(); 
               
        });
    };
    
document.addEventListener('DOMContentLoaded', init);

});


