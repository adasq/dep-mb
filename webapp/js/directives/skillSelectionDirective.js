(function(){
'use strict'
var skillSelection = function($log, $timeout){
	 var link = function(scope, element, attr) {
            //content 
            // $log.log(skills);

            var state = scope.state = {
            	DEFAULT: 0,
            	IN_PROGRESS: 1,
            	SUCCESS: 2,
            	ERROR: 3
            },
            ERROR_MSG_TIMEOUT = 2000,
            onSkillSelection = scope.onSkillSelection();
          

    //         scope.skills2 = [{ style: 'background : url(\'/img/skills.png\') -210px -90px',
    // skillId: '67',
    // name: 'Cold Blooded',
    // description: 'Snaps takes aim twice as quickly. "We\'re not going to waste time talking sense here..."' },
    // { style: 'background : url(\'/img/skills.png\') -0px -90px',
    // skillId: '60',
    // name: 'Toxic shells',
    // description: 'Snaps fires up to 3 toxic shells which poison the enemy. "You look a little off-colour there Roger. Are you sure you don\'t need a little liedown? "' }];

 
      scope.selectSkill = function(skill){
        scope.currentState = state.IN_PROGRESS;
        var promise = onSkillSelection(skill);
        promise.then(function(result){
            scope.result = result;
            scope.currentState = state.SUCCESS;
        }, function(result){
            scope.result = result;
            scope.currentState = state.ERROR;
            $timeout(function(){
                scope.currentState = state.DEFAULT;
            }, ERROR_MSG_TIMEOUT)
        });       
      }

      scope.$watch('skills', function(){
      	$log.log('skills: ',scope.skills);
      	 scope.currentState = state.DEFAULT;
      });

        };
        return {
            link: link,
            scope: {
            	skills: "=",
            	onSkillSelection: "&"
            },
            restrict: "E",
            templateUrl: "views/directives/skillSelectionView.html"
        };
};
angular
.module("directives")
.directive("mbSkillSelection", skillSelection);
})();