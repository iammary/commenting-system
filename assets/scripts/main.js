(function ($, BB, _) {

	var App = Backbone.View.extend({
		el: "#comments",
		events: {
			'click button': 'addComment'
		},
		initialize: function () {
			this.comment_list = $('#comment_list');
			this.input_name = $('input[name=author]');
			this.input_comment = $('textarea');

			this.listenTo(this.collection,'add', this.createView);
			this.collection.fetch();
		},
		addComment: function (evt) {
			
			_this = this;
			var comment = new CommentModel({
				author: _this.input_name.val(),
				message: _this.input_comment.val(),
				upvotes: 0
			});

			console.log(comment);
			
			comment.save(null, {
				success: function(model, resp, options) {
					_this.collection.add(model);
				},
				error: function(model, xhr, options) {
					alert('Error in saving.');
					//clearField(_this.input_username, true);
				}
			})
		},

		createView: function(model) {
			
			var diff = getElapsed(model.attributes.time);
			model.set("time_elapsed", diff);
			var view = new CommentView({model: model});
			this.comment_list.append(view.render().el);
			this.input_name.val('');
			this.input_comment.val('');	
		},
	}); 

	function getElapsed(commentDate) {
		var now = new Date();
		var commentTime = new Date(commentDate);
		var elapsed = now.getTime() - commentTime.getTime();
		hours = Math.floor(elapsed/1000/60/60);
		minutes =  Math.floor((elapsed - hours*1000*60)/1000/60);
		seconds = Math.floor((elapsed - minutes*60*1000)/1000);
		return ('Comment created ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds ago');
	}

	var CommentModel = Backbone.Model.extend({
		idAttribute: '_id',
		url: function() {
			var location = "http://localhost:9090/comments";
			return this.id ? (location + '/' + this.id) : location;
		},
		defaults: {
			'author': '-',
			'message': '-',
			'upvotes': 0,
		},
		initialize: function () {
			
		}
		
	});

	var CommentCollection = Backbone.Collection.extend({
		model: CommentModel,
		url: 'http://localhost:9090/comments',
		initialize: function () {

		}
	});

	var CommentView = Backbone.View.extend({
		tagName: 'li',
		template: $('#comment-template').html(),
		//edit_template: $('#edit_mode_template').html(),
		events: {
			'click .delete': 'deleteComment',
			'click .upvote': 'upvoteComment',
		},
		initialize: function() {
			this.listenTo(this.model, 'destroy', this.removeView);
			this.listenTo(this.model, 'change', this.viewUpdate);
		},
		deleteComment: function(evt) {
			this.model.destroy({
				wait: true,
				success: function(model, resp, opt) {
					console.log('model destroy success: ', model);
				},
				error: function (model, xhr, opt) {
					console.log('model destroy error: ', model);
				}
			})
		},
		upvoteComment: function(evt) {

			
			var count = this.model.attributes.upvotes;
			console.log(count);
			count++;
			var newAttrs = {
				name: this.$el.find('a.author').text(),
				message: this.$el.find('.text').text(),
				upvotes: count
			}

			//this.model.set('upvotes', 3);
			this.model.save(newAttrs, {
				wait: true,
				success: function (model, resp, opt) {
					console.log('model update success: ', model);
				},
				error: function (model, xhr, opt) {
					console.log('model update error: ', model);
					alert('Error on saving');
					//clearField($('.highlight input[name=username]'), true);
				}
			});
		},
		removeView: function() {
			this.undelegateEvents();
			this.stopListening();
			this.remove();
		},
		viewUpdate: function() {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()))
			return this;
		},
		render: function() {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()))
			return this;
		},
	});

	var commentApp = new App({collection: new CommentCollection()});


})(jQuery, Backbone, _)