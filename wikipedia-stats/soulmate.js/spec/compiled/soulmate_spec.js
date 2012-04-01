(function() {
  var Soulmate;

  Soulmate = window._test.Soulmate;

  describe('Soulmate', function() {
    var renderCallback, selectCallback, soulmate;
    soulmate = renderCallback = selectCallback = null;
    beforeEach(function() {
      renderCallback = function(term, data, type) {
        return term;
      };
      selectCallback = function() {};
      setFixtures(sandbox());
      $('#sandbox').html($('<input type="text" id="search">'));
      return soulmate = new Soulmate($('#search'), {
        url: 'http://localhost',
        types: ['type1', 'type2', 'type3'],
        renderCallback: renderCallback,
        selectCallback: selectCallback,
        minQueryLength: 2,
        maxResults: 5
      });
    });
    context('with a mocked fetchResults method', function() {
      beforeEach(function() {
        return soulmate.fetchResults = function() {};
      });
      it('adds a container to the dom with an id of "soulmate"', function() {
        return expect($('#soulmate')).toExist();
      });
      describe('mousing over the input field', function() {
        return it('should blur all the suggestions', function() {
          return expect(function() {
            return soulmate.input.trigger('mouseover');
          }).toCall(soulmate.suggestions, 'blurAll');
        });
      });
      describe('pressing a key down in the input field', function() {
        var keyDown, keyDownEvent;
        keyDown = keyDownEvent = null;
        beforeEach(function() {
          keyDownEvent = $.Event('keydown');
          return keyDown = function(key) {
            var KEYCODES;
            KEYCODES = {
              tab: 9,
              enter: 13,
              escape: 27,
              up: 38,
              down: 40
            };
            keyDownEvent.keyCode = KEYCODES[key];
            return soulmate.input.trigger(keyDownEvent);
          };
        });
        describe('escape', function() {
          return it('hides the container', function() {
            return expect(function() {
              return keyDown('escape');
            }).toCall(soulmate, 'hideContainer');
          });
        });
        describe('tab', function() {
          var tab;
          tab = function() {
            return keyDown('tab');
          };
          it('selects the currently focused selection', function() {
            return expect(tab).toCall(soulmate.suggestions, 'selectFocused');
          });
          return it('prevents the default action', function() {
            return expect(tab).toCall(keyDownEvent, 'preventDefault');
          });
        });
        describe('enter', function() {
          var enter;
          enter = function() {
            return keyDown('enter');
          };
          it('selects the currently focused selection', function() {
            return expect(enter).toCall(soulmate.suggestions, 'selectFocused');
          });
          context('when no suggestion is focused', function() {
            beforeEach(function() {
              return soulmate.suggestions.allBlured = function() {
                return true;
              };
            });
            return it('submits the form', function() {
              return expect(enter).not.toCall(keyDownEvent, 'preventDefault');
            });
          });
          return context('when a suggestion is focused', function() {
            beforeEach(function() {
              return soulmate.suggestions.allBlured = function() {
                return false;
              };
            });
            return it('doesnt submit the form', function() {
              return expect(enter).toCall(keyDownEvent, 'preventDefault');
            });
          });
        });
        describe('up', function() {
          return it('focuses the previous selection', function() {
            return expect(function() {
              return keyDown('up');
            }).toCall(soulmate.suggestions, 'focusPrevious');
          });
        });
        describe('down', function() {
          return it('focuses the next selection', function() {
            return expect(function() {
              return keyDown('down');
            }).toCall(soulmate.suggestions, 'focusNext');
          });
        });
        return describe('any other key', function() {
          return it('allows the default action to occur', function() {
            return expect(function() {
              return keyDown('a');
            }).not.toCall(keyDownEvent, 'preventDefault');
          });
        });
      });
      describe('releasing a key in the input field', function() {
        var keyUp;
        keyUp = function() {
          return soulmate.input.trigger('keyup');
        };
        it('sets the current query value to the value of the input field', function() {
          return expect(keyUp).toCallWith(soulmate.query, 'setValue', [soulmate.input.val()]);
        });
        context('when the query has not changed', function() {
          beforeEach(function() {
            return soulmate.query.hasChanged = function() {
              return false;
            };
          });
          it('should not fetch new results', function() {
            return expect(keyUp).not.toCall(soulmate, 'fetchResults');
          });
          return it('should not hide the container', function() {
            return expect(keyUp).not.toCall(soulmate, 'hideContainer');
          });
        });
        return context('when the query has changed', function() {
          beforeEach(function() {
            return soulmate.query.hasChanged = function() {
              return true;
            };
          });
          context('when the query will have results', function() {
            beforeEach(function() {
              return soulmate.query.willHaveResults = function() {
                return true;
              };
            });
            it('should blur the suggestions', function() {
              return expect(keyUp).toCall(soulmate.suggestions, 'blurAll');
            });
            return it('should fetch new results', function() {
              return expect(keyUp).toCall(soulmate, 'fetchResults');
            });
          });
          return context('when the query will have no results', function() {
            beforeEach(function() {
              return soulmate.query.willHaveResults = function() {
                return false;
              };
            });
            return it('should hide the container', function() {
              return expect(keyUp).toCall(soulmate, 'hideContainer');
            });
          });
        });
      });
      context('showing suggestions', function() {
        beforeEach(function() {
          return soulmate.update(fixtures.responseWithResults.results);
        });
        describe('clicking outside of the container', function() {
          return it('hides the container', function() {
            return expect(function() {
              return $('#sandbox').trigger('click.soulmate');
            }).toCall(soulmate, 'hideContainer');
          });
        });
        describe('mousing over a suggestion', function() {
          return it('should focus that suggestion', function() {
            var mouseover, suggestion;
            suggestion = soulmate.suggestions.suggestions[0];
            mouseover = function() {
              return suggestion.element().trigger('mouseover');
            };
            return expect(mouseover).toCall(suggestion, 'focus');
          });
        });
        return describe('clicking a suggestion', function() {
          var click, suggestion;
          click = suggestion = null;
          beforeEach(function() {
            suggestion = soulmate.suggestions.suggestions[0];
            return click = function() {
              return suggestion.element().trigger('click');
            };
          });
          it('refocuses the input field so it remains active', function() {
            click();
            return expect(soulmate.input.is(':focus')).toBeTruthy();
          });
          return it('selects the clicked suggestion', function() {
            return expect(click).toCall(soulmate.suggestions, 'selectFocused');
          });
        });
      });
      describe('#hideContainer', function() {
        it('blurs all the suggestions', function() {
          return expect(function() {
            return soulmate.hideContainer();
          }).toCall(soulmate.suggestions, 'blurAll');
        });
        return it('hides the container', function() {
          soulmate.container.show();
          soulmate.hideContainer();
          return expect(soulmate.container).toBeHidden();
        });
      });
      describe('#showContainer', function() {
        return it('shows the container', function() {
          soulmate.container.hide();
          soulmate.showContainer();
          return expect(soulmate.container).toBeVisible();
        });
      });
      return describe('#update', function() {
        context('with a non-empty result set', function() {
          var update;
          update = function() {
            return soulmate.update(fixtures.responseWithResults.results);
          };
          it('shows the container', function() {
            return expect(update).toCall(soulmate, 'showContainer');
          });
          return it('shows the new suggestions', function() {
            update();
            return expect(soulmate.container.html()).toMatch(/2012 Super Bowl/);
          });
        });
        return context('with an empty result set', function() {
          var update;
          update = function() {
            return soulmate.update(fixtures.responseWithNoResults.results);
          };
          it('hides the container', function() {
            return expect(update).toCall(soulmate, 'hideContainer');
          });
          return it('marks the current query as empty', function() {
            return expect(update).toCall(soulmate.query, 'markEmpty');
          });
        });
      });
    });
    describe('#fetchResults', function() {
      beforeEach(function() {
        soulmate.query.setValue('job');
        spyOn($, 'ajax');
        return soulmate.fetchResults();
      });
      it('requests the given url as an ajax request', function() {
        return expect($.ajax.mostRecentCall.args[0].url).toEqual(soulmate.url);
      });
      return it('calls "update" with the responses results on success', function() {
        return expect(function() {
          return $.ajax.mostRecentCall.args[0].success({
            results: {}
          });
        }).toCall(soulmate, 'update');
      });
    });
    return it("can accept timeout as a parameter", function() {
      var soulmate2;
      soulmate2 = new Soulmate($('#search'), {
        url: 'http://localhost',
        types: ['type1', 'type2', 'type3'],
        timeout: 2000,
        renderCallback: renderCallback,
        selectCallback: selectCallback,
        minQueryLength: 2,
        maxResults: 5
      });
      expect(soulmate2.timeout).toNotEqual(500);
      return expect(soulmate2.timeout).toEqual(2000);
    });
  });

}).call(this);
