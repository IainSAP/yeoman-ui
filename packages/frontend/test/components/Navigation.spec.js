import { initComponent, unmount } from "../Utils";
import Navigation from "../../src/components/Navigation.vue";
import Vue from "vue";
//There are issues of importing vuetify components https://github.com/vuejs/vue-cli/issues/1584
// import { VBtn } from 'vuetify/lib'

import _ from "lodash";

let wrapper;

describe("Navigation.vue", () => {
  afterEach(() => {
    unmount(wrapper);
  });

  test("component name", () => {
    wrapper = initComponent(Navigation, { promptIndex: 1, prompts: 1 }, true);
    expect(wrapper.vm.$options.name).toBe("Navigation"); // wrapper.name() is deprecated
  });

  test("component props length", () => {
    wrapper = initComponent(Navigation, { promptIndex: 1, prompts: 1 }, true);
    expect(_.keys(wrapper.props())).toHaveLength(3);
  });

  test("component props - promptIndex ", async () => {
    wrapper = initComponent(Navigation, { promptIndex: 1, prompts: 1 }, true);
    expect(wrapper.vm.steps).toEqual(1);
    expect(wrapper.vm.currentStep).toEqual(1);
    wrapper.vm.$options.watch.prompts.call(wrapper.vm, [1, 2, 3]);
    expect(wrapper.vm.steps).toEqual(3);
    wrapper.vm.$options.watch.promptIndex.call(wrapper.vm, 5);

    await Vue.nextTick();
    expect(wrapper.vm.currentStep).toEqual(6);
  });

  test("component props - promptAnswers", async () => {
    const promptAnswersSpy = jest.spyOn(Navigation.watch, "promptAnswers");
    wrapper = initComponent(Navigation, { promptIndex: 0, prompts: [{ firstStep: 1 }, { secondStep: 2 }] }, true);

    let firstStepAnswers = {
      promptName: "1st prompt",
      answers: [
        { label: "answerLabel1", value: "answerValue1" },
        { label: "answerLabel2", value: "answerValue2" },
      ],
    };

    await wrapper.setProps({ promptAnswers: firstStepAnswers });
    expect(promptAnswersSpy).toHaveBeenCalledTimes(1);
    expect(promptAnswersSpy).toHaveBeenCalledWith(firstStepAnswers, undefined);
    expect(wrapper.vm.answers).toEqual({ [firstStepAnswers.promptName]: firstStepAnswers.answers });

    firstStepAnswers = {
      promptName: "1st prompt",
      answers: [
        { label: "answerLabel1", value: "answerValue1" },
        { label: "answerLabel3", value: "answerValue3" },
      ],
    };
    // Same step, answers should be replaced
    await wrapper.setProps({
      promptAnswers: firstStepAnswers,
    });
    expect(wrapper.vm.answers).toEqual({ [firstStepAnswers.promptName]: firstStepAnswers.answers });

    // A different step, answers should be appended
    let secondStepAnswers = {
      promptName: "2nd prompt",
      answers: [
        { label: "answerLabel4", value: "answerValue4" },
        { label: "answerLabel5", value: "answerValue5" },
      ],
    };
    await wrapper.setProps({ promptAnswers: secondStepAnswers });
    expect(wrapper.vm.answers).toEqual({
      [firstStepAnswers.promptName]: firstStepAnswers.answers,
      [secondStepAnswers.promptName]: secondStepAnswers.answers,
    });
  });

  describe("gotoStep", () => {
    test("numOfSteps > 0", async () => {
      wrapper = initComponent(Navigation, { promptIndex: 1, prompts: 1 }, true);
      expect(wrapper.vm.steps).toEqual(1);
      expect(wrapper.vm.currentStep).toEqual(1);
      wrapper.vm.$options.watch.prompts.call(wrapper.vm, [1, 2, 3]);
      expect(wrapper.vm.steps).toEqual(3);
      wrapper.vm.$options.watch.promptIndex.call(wrapper.vm, 2);

      await Vue.nextTick();
      expect(wrapper.vm.currentStep).toEqual(3);

      let numOfSteps = wrapper.vm.currentStep - 1;
      wrapper.vm.gotoStep(numOfSteps);

      expect(wrapper.emitted().onGotoStep).toBeTruthy();
    });

    test("numOfSteps = 0", async () => {
      wrapper = initComponent(Navigation, { promptIndex: 1, prompts: 1 }, true);
      expect(wrapper.vm.steps).toEqual(1);
      expect(wrapper.vm.currentStep).toEqual(1);
      wrapper.vm.$options.watch.prompts.call(wrapper.vm, [1, 2, 3]);
      expect(wrapper.vm.steps).toEqual(3);
      wrapper.vm.$options.watch.promptIndex.call(wrapper.vm, 2);

      await Vue.nextTick();
      expect(wrapper.vm.currentStep).toEqual(3);

      let numOfSteps = wrapper.vm.currentStep - 3;
      wrapper.vm.gotoStep(numOfSteps);

      expect(wrapper.emitted().onGotoStep).toBeFalsy();
    });
  });

  test("getStepClass method", async () => {
    wrapper = initComponent(Navigation, { promptIndex: 1, prompts: 1 }, true);
    expect(wrapper.vm.steps).toEqual(1);
    expect(wrapper.vm.currentStep).toEqual(1);
    wrapper.vm.$options.watch.prompts.call(wrapper.vm, [1, 2, 3]);
    expect(wrapper.vm.steps).toEqual(3);
    wrapper.vm.$options.watch.promptIndex.call(wrapper.vm, 2);

    await Vue.nextTick();
    expect(wrapper.vm.currentStep).toEqual(3);

    let claz = wrapper.vm.getStepClass(wrapper.vm.currentStep, 1);
    expect(claz).toEqual({ "step-linkable": true });

    claz = wrapper.vm.getStepClass(wrapper.vm.currentStep, 3);
    expect(claz).toEqual({ "step-linkable": false });
  });
});
