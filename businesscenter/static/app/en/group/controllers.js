angular.module('group.controllers', ['group.services', 'group.directives',
'common.services', 'auth.services', 'selfie'])
.controller('CtrlGroupAdd', ['$scope', '$rootScope','$http',
'$location', '$route', 'Auth', 'MultipartForm',
    function($scope, $rootScope, $http, $location, $route, Auth, MultipartForm) {

        $rootScope.title = 'New group';

        var auth_promise = Auth.is_authenticated();

        auth_promise.then(function(result){
            if (!result.is_authenticated){
                $window.location.replace("/visitor/");
            }
        });

        $scope.add = function() {
            var url = '/api/v1/group/';
            MultipartForm('POST', '#group_form', url).then(function(response) {
                $rootScope.alerts.push({ type: 'success', msg: 'Your group was successfully added!'});
                    // for images
                    //$scope.random = Math.floor((Math.random()*1000));
                    $location.path('/group/' + response.data.id + '/manage');
                },
                function(error) {
                    $scope.error = error.data;
                }
            );

        };

    }
])
.controller('CtrlGroupList', ['$scope', '$rootScope','$http',
'$location', '$routeParams','GetPageLink' , 'Group', 'title', 'my',
    function($scope, $rootScope, $http, $location, $routeParams, GetPageLink, Group, title, my) {

        $rootScope.title = title;
        var query = (my) ? Group.my : Group.query;

        if (my){
            $rootScope.bar = 'verbose';
        }
        $scope.r = query($routeParams,
            function(success){

                $scope.enough = success.total > 1 ? false : true;
                $scope.page_link = GetPageLink();
                $scope.page = success.current;
                $scope.prev_pages = [];
                $scope.next_pages = [];
                var i = (success.current - 1 > 5) ? success.current - 5: 1;
                var next_lim = (success.total - success.current > 5) ? 5 + success.current : success.total;
                var j = success.current + 1;
                for (i; i < success.current; i++){ $scope.prev_pages.push(i);}
                for (j; j <= next_lim; j++){ $scope.next_pages.push(j);}
            },
            function(error){
                for (var e in error.data){
                        $rootScope.alerts.push({ type: 'danger', msg: error.data[e]});
                    }
                    $scope.error = error.data;
            }
        );

        $scope.get_more = function(){
            $scope.page += 1;
            var params = $routeParams;
            params['page'] = $scope.page;
            query(params, function(success){
                    $scope.r.results = $scope.r.results.concat(success.results);
                    $scope.enough = ($scope.page >= $scope.r.total) ? true : false;
                },
                function(error){
                    $rootScope.alerts.push({ type: 'danger', msg: error.data[e]});
                }
            );
        }
    }
])
.controller('CtrlGroupPhotoList', ['$scope', '$rootScope','$http',
'$location', '$routeParams','GetPageLink' , 'Group', 'IsMember',
    function($scope, $rootScope, $http, $location, $routeParams, GetPageLink, Group, IsMember) {

        $scope.can_edit = false;

        $scope.group = Group.get({pk: $routeParams.pk},
            function(success){
                if ($rootScope.visitor.pk == success.owner ||
                    IsMember(success.members, $rootScope.visitor.pk)){
                    $scope.can_edit = true;
                }
            }
        );
        var queryParams = {pk: $routeParams.pk, page: $routeParams.page};


        $scope.r = Group.photo_list(queryParams,
            function(success){
                $rootScope.title = 'Groups photo';
                $scope.enough = success.total > 1 ? false : true;
                $scope.page_link = GetPageLink();
                $scope.page = success.current;
                $scope.prev_pages = [];
                $scope.next_pages = [];
                var i = (success.current - 1 > 5) ? success.current - 5: 1;
                var next_lim = (success.total - success.current > 5) ? 5 + success.current : success.total;
                var j = success.current + 1;
                for (i; i < success.current; i++){ $scope.prev_pages.push(i);}
                for (j; j <= next_lim; j++){ $scope.next_pages.push(j);}
            },
            function(error){
                for (var e in error.data){
                        $rootScope.alerts.push({ type: 'danger', msg: error.data[e]});
                    }
                    $scope.error = error.data;
            }
        );

        $scope.get_more = function(){
            $scope.page += 1;
            var params = {pk: $routeParams.pk, page: $scope.page};
            Group.photo_list(params, function(success){
                    $scope.r.results = $scope.r.results.concat(success.results);
                    $scope.enough = ($scope.page >= $scope.r.total) ? true : false;
                },
                function(error){
                    for (var e in error.data){
                        $rootScope.alerts.push({ type: 'danger', msg: error.data[e]});
                    }
                    $scope.error = error.data;
                }
            );
        }
    }
])
.controller('CtrlGroupManage', ['$scope', '$rootScope','$http',
'$location', '$routeParams', '$window', 'Auth', 'Group', 'MultipartForm', 'Tag', 'IsMember', 'RemoveItem',
    function($scope, $rootScope, $http, $location, $routeParams, $window,
    Auth, Group, MultipartForm, Tag, IsMember, RemoveItem) {

        $rootScope.title = 'Update group';
        $scope.is_owner = false;
        $scope.can_edit = false;
        $scope.r = Group.get({pk: $routeParams.pk},
            function(success){
                $scope.data = {title: success.title,
                               description: success.description,
                               is_private: success.is_private};
                if ($rootScope.visitor.pk == success.owner){
                    $scope.is_owner = true;
                }
                if ($rootScope.visitor.pk != success.owner){

                    $rootScope.alerts.push({ type: 'warning',
                        msg: 'You have not enough privileges to manage this group'});
                }
                if (IsMember(success.members, $rootScope.visitor.pk)){
                    $scope.can_edit = true;
                }
            },
            function(error) {
                // TODO: move that func to partials/common, remove duplicates
                for (var e in error.data){
                    $rootScope.alerts.push({ type: 'danger', msg: error.data[e]});
                }
                $scope.error = error.data;
            }
        );
        $scope.random = Math.floor((Math.random()*1000));

        $scope.update_group = function() {
            Group.update({pk: $routeParams.pk}, $scope.data, function(success){
                    $location.path('/group/'+ $routeParams.pk + '/photo');
                },
                function(error){
                    $rootScope.alerts.push({ type: 'danger', msg: 'Error!'});
                }
            );
        };

        $scope.member_remove = function(member_id){
            var confirm = $window.confirm('Are you sure you want to exclude this collaborator?');
            if (confirm){
                Group.member_remove({pk: $routeParams.pk}, {member: member_id},
                    function(success){
                        $rootScope.alerts.push({ type: 'info', msg: 'Collaborator has been excluded.'});
                        RemoveItem($scope.r.members, member_id);
                    },
                    function(error){
                        $rootScope.alerts.push({ type: 'danger', msg: error.data.error });
                    }
                );
            }
        }

        $scope.tag_remove = function(tag_id){
            var confirm = $window.confirm('Are you sure you want to remove this tag?');
            if (confirm){
                Tag.remove({pk: tag_id},
                    function(success){
                        $rootScope.alerts.push({ type: 'info', msg: 'Tag has been removed'});
                        RemoveItem($scope.r.tags, tag_id);
                    },
                    function(error){
                        $rootScope.alerts.push({ type: 'danger', msg: error.data.error });
                    }
                );

            }
        }
        $scope.member_add = function(){
            console.log($scope.member);
            Group.member_add({pk: $routeParams.pk}, {username: $scope.member},
                function(success){
                    $rootScope.alerts.push({ type: 'info', msg: 'A new member has been added to the group'});
                    $scope.r.members.push(success);
                    $scope.member = '';
                },
                function(error){
                    $rootScope.alerts.push({ type: 'danger', msg: error.data.error });
                }
            );
        }

        $scope.create_tag = function(){
            Group.tag_create({pk: $routeParams.pk}, {title: $scope.tag_title},
                function(success){
                    $rootScope.alerts.push({ type: 'info', msg: 'A new tag has been created'});
                    $scope.tag_title = '';
                    $scope.r.tags.push(success);
                },
                function(error){
                    $rootScope.alerts.push({ type: 'danger', msg: error.data.error });
                }
            );
        }
    }
])
.controller('CtrlGroupPhotoAdd', ['$scope', '$rootScope','$http',
'$location', '$routeParams', 'Auth', 'MultipartForm', 'Group', 'IsMember', 'RemoveItem',
    function($scope, $rootScope, $http, $location, $routeParams, Auth, MultipartForm, Group, IsMember, RemoveItem) {

        $rootScope.title = 'New group';
        $scope.can_add = false;

        $scope.group = Group.get({pk: $routeParams.pk},
            function(success){
                if ($rootScope.visitor.pk == success.owner ||
                    IsMember(success.members, $rootScope.visitor.pk)){
                    $scope.can_add = true;
                }
            }
        );

        $scope.add = function() {
            var url = '/api/v1/group/'+ $scope.group.id +'/photo_create/';
            MultipartForm('POST', '#photo_form', url).then(function(response) {
                $rootScope.alerts.push({ type: 'success', msg: 'Photo has been added to your group!'});
                    $location.path('/group/' + $scope.group.id + '/photo');
                },
                function(error) {
                    $scope.error = error.data;
                }
            );

        };

    }
]);