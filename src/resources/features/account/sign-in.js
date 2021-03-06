import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import TranslationService from 'resources/services/translation-service';
import { ValidationControllerFactory,
  ValidationRules,
  validateTrigger  } from 'aurelia-validation';
import { MaterializeFormValidationRenderer } from 'aurelia-materialize-bridge';
import AuthService from 'resources/services/auth-service';
import FacebookService from 'resources/services/facebook-service';
import UserService from 'resources/services/user-service';
import ToastService from 'resources/services/toast-service';
import LoaderService from 'resources/services/loader-service';


@inject(Router, I18N, TranslationService,
ValidationControllerFactory, AuthService,
FacebookService, UserService, ToastService, LoaderService)
export class SignIn {
  constructor(router, i18n, translationService,
  controllerFactory, authService, facebookService,
  userService, toast, loader) {
    this.router = router;
    this.i18n = i18n;
    this.translationService = translationService;
    this.authService = authService;
    this.facebookService = facebookService.init();
    this.userService = userService;
    this.account = {
      email: '',
      password: '',
      provider: 'collectively'
    };
    this.toast = toast;
    this.loader = loader;
    this.sending = false;
    this.controller = controllerFactory.createForCurrentScope();
    this.controller.validateTrigger = validateTrigger.blur;
    this.controller.addRenderer(new MaterializeFormValidationRenderer());

    ValidationRules
      .ensure('email')
        .required()
          .withMessage(this.translationService.tr('account.email_is_required'))
        .email()
          .withMessage(this.translationService.tr('account.email_is_invalid'))
        .maxLength(100)
          .withMessage(this.translationService.tr('account.email_is_invalid'))
      .ensure('password')
        .required()
          .withMessage(this.translationService.tr('account.password_is_required'))
        .minLength(4)
          .withMessage(this.translationService.tr('account.password_is_invalid'))
        .maxLength(100)
          .withMessage(this.translationService.tr('account.password_is_invalid'))
      .on(this.account);
  }

  get signInAllowed() {
    return 'geolocation' in navigator;
  }

  async submit() {
    let errors = await this.controller.validate();
    if (errors.length > 0) {
      this.sending = false;
      return;
    }

    this.loader.display();
    this.sending = true;
    this.toast.info(this.translationService.tr('account.signing_in'));
    let session = await this.userService.signIn(this.account);
    if (session.token) {
      this.authService.session = {
        sessionId: session.sessionId,
        sessionKey: session.sessionKey,
        token: session.token,
        expiry: session.expiry,
        key: session.key,
        provider: 'collectively'
      };
      this.loader.hide();
      this.router.navigateToRoute('location');

      return;
    }

    this.sending = false;
    this.loader.hide();
    this.toast.error(this.translationService.trCode('invalid_credentials'));
  }

  facebookSignIn() {
    this.sending = true;
    this.loader.display();
    this.facebookService.login(() => {
      this.loader.hide();
      this.router.navigateToRoute('location');

      return;
    }, () => {
      this.loader.hide();
      this.sending = false;
    });
  }
}
