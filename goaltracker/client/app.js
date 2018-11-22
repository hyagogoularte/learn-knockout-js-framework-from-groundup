function errorCallback(err) {
    throw err;
}

function getGoals() {
    $.get('http://localhost:3000/goals', function (data) {
        var dataFormatted = [];
        $.each(data, function (index, value) {
            console.log(value)
            dataFormatted.push(new Goal(value._id, value.name, value.type, value.deadline));
        });

        viewModel.goals(dataFormatted);
    })
}

function saveGoal(data, success, error) {
    $.ajax({
        url: 'http://localhost:3000/goals/',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: success,
        error: error || errorCallback
    })
}

function updateGoal(id, data, success, error) {
    var url = 'http://localhost:3000/goals/' + id;

    $.ajax({
        url: url,
        type: 'PUT',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: success,
        error: error || errorCallback
    })
}

function deleteGoal(id, success, error) {
    var url = 'http://localhost:3000/goals/' + id;
    $.ajax({
        url: url,
        type: 'DELETE',
        async: true,
        timeout: 300000,
        success: success,
        error: error || errorCallback
    })
}

function getTypes() {
    return ['Health & Fitness', 'Professional', 'Relationships', 'Self Help'];
}

function getValueNameFromId(id) {
    return $('#' + id).val();
}

function Goal(id, name, type, deadline, isChecked = false) {
    return {
        id: ko.observable(id),
        name: ko.observable(name),
        type: ko.observable(type),
        deadline: ko.observable(deadline),
        isChecked: ko.observable(isChecked)
    }
}

function ViewModel() {
    var self = this;
    self.query = ko.observable('');
    self.goals = ko.observableArray();
    self.types = ko.observableArray(getTypes());
    self.selectedGoals = ko.observableArray();
    self.isUpdate = ko.observable(false);
    self.updatedId = ko.observable();

    self.goal = ko.observable(new Goal());

    self.searchableGoals = ko.computed(function () {
        var filter = self.query().toLowerCase();

        if (!filter) {
            return self.goals();
        } else {
            return ko.utils.arrayFilter(self.goals(), function (item) {
                return item.name.toLowerCase().indexOf(filter) !== -1 || item.type.toLowerCase().indexOf(filter) !== -1;
            });
        }
    });

    self.isAllGoalsChecked = ko.computed(function () {
        return self.selectedGoals().length === self.searchableGoals().length;
    });

    // ko.computed will observe all changes from self.selectedGoals and will updated the value canEdit
    self.canEdit = ko.computed(function () {
        return self.selectedGoals().length === 1;
    });

    self.canDelete = ko.computed(function () {
        return self.selectedGoals().length > 0 && !self.canCancel();
    });

    self.canCancel = ko.computed(function () {
        return self.isUpdate();
    });

    self.teste = function () {
        if (!self.isAllGoalsChecked()) {
            $.each(self.searchableGoals(), function (index, value) {
                self.selectedGoals.push(value)
            });
        } else {
            self.selectedGoals.removeAll();
        }
    }

    self.onClickAddGoal = function () {
        var name = getValueNameFromId('name');
        var type = getValueNameFromId('type');
        var deadline = getValueNameFromId('deadline');
        var data = {
            "name": name,
            "type": type,
            "deadline": deadline
        };

        // this way don't save on base
        // self.goals.push({
        //     name: name,
        //     type: type,
        //     deadline: deadline
        // });

        // this way send a ajax request to server to added goal on base
        saveGoal(data, function (response) {
            onResetInputs();
            getGoals();
        });
    };

    self.onClickUpdateGoal = function () {
        console.log('add goal started...')
        var id = self.updatedId;
        var name = getValueNameFromId('name');
        var type = getValueNameFromId('type');
        var deadline = getValueNameFromId('deadline');
        var data = {
            "id": id,
            "name": name,
            "type": type,
            "deadline": deadline
        };

        // this way don't save on base
        // self.goals.remove(function (item) {
        //     return item._id === id;
        // });
        // self.goals.push({
        //     name: name,
        //     type: type,
        //     deadline: deadline
        // });

        // this way send a ajax request to server to added goal on base
        updateGoal(id, data, function (response) {
            getGoals();
            onResetInputs();
        });
    };

    self.onClickEditGoal = function () {
        var goal = self.selectedGoals()[0];

        self.updatedId = goal.id();
        self.goal(new Goal(goal.id(), goal.name(), goal.type(), goal.deadline()));
        self.isUpdate(true);
    };

    self.onClickDeleteGoal = function () {
        $.each(self.selectedGoals(), function (index, value) {
            var id = value.id();

            deleteGoal(id, function (response) {
                onResetInputs();
            });
        });

        self.goals.removeAll(self.selectedGoals());
        self.selectedGoals.removeAll();
    }

    self.onClickResetForm = function () {
        onResetInputs();
    }

    function onResetInputs() {
        self.goal(new Goal());
        self.isUpdate(false);
        self.selectedGoals.removeAll();
    }
}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);