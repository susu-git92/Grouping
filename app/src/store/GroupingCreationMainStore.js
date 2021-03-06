import { action, computed, observable } from 'mobx';
import { Text } from 'react-native';
import * as React from 'react';
import { GROUPING_CREATION_VIEW_STATUS } from '../constant/GroupingCreationViewStatus';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import GroupingCreationDto from '../dto/GroupingCreationDto';
import KeywordParser from '../component/KeywordParser';
import MapRepository from '../repository/MapRepository';
import KoreanChecker from '../component/KoreanChecker';
import AgeValidator, {
  MAX_AVAILABLE_AGE,
  MIN_AVAILABLE_AGE,
} from '../component/AgeValidator';
import { INPUT_EMAIL_STATUS } from '../constant/InputEmailStatus';
import { ResponseCode } from '../constant/ResponseCode';
import { INPUT_PASSWORD_STATUS } from '../constant/InputPasswordStatus';
import { INPUT_STATUS } from '../constant/InputStatus';
import { INPUT_PHONE_STATUS } from '../constant/InputPhoneStatus';
import GroupCreationRepository from '../repository/GroupCreationRepository';
import UserStore from './UserStore';
import GroupingStore from './GroupingStore';
import GroupingUserDto from '../dto/GroupingUserDto';
import { COLORS } from '../assets/Colors';

const MIN_DESCRIPTION_LENGTH = 10;
const MIN_TITLE_LENGTH = 2;

export default class GroupingCreationMainStore {
  groupingUserId = '';

  groupCreationRepository = new GroupCreationRepository();

  mapRepository = new MapRepository();

  koreanChecker = new KoreanChecker();

  ageValidator = new AgeValidator();

  @observable groupingCreationViewStatus = GROUPING_CREATION_VIEW_STATUS.NAME;

  @observable groupingCreationDto = new GroupingCreationDto();

  @observable groupingTitle = '';

  @observable groupingKeyword = '';

  @observable groupingDescription = '';

  @observable groupingAddressSearchKeyword = '';

  @observable groupingAddressSearchResult = [];

  @observable groupingAddress = '';

  @observable groupingGender = 'ALL';

  @observable groupingAvailableMinAge = Number(MIN_AVAILABLE_AGE);

  @observable groupingAvailableMaxAge = Number(MAX_AVAILABLE_AGE);

  @observable groupingPreviewNextButtonActivated = false;

  @observable groupingDescriptionCompleted = false;

  @observable groupingAddressCompleted = false;

  @observable keywordParser = new KeywordParser();

  @observable hashtagList = [];

  @observable genderChanged = false;

  // @observable groupingBackgroundImageURI = require('../assets/default_group_image.jpg');
  @observable groupingBackgroundImageURI = '';

  constructor(groupingStore: GroupingStore) {
    this.groupingStore = groupingStore;
  }

  @action groupingInitializeGender = () => {
    this.groupingGender = 'ALL';
    console.log(this.groupingGender);
  };

  @action groupingInitializeAge = () => {
    this.groupingAvailableMinAgeChanged(Number(MIN_AVAILABLE_AGE));
    this.groupingAvailableMaxAgeChanged(Number(MAX_AVAILABLE_AGE));
    console.log(this.groupingAvailableMinAge);
    console.log(this.groupingAvailableMaxAge);
  };

  @action groupingTitleChanged = (title) => {
    this.groupingTitle = title;
    this.groupingCreationDto.title = title;
  };

  @action groupingKeywordChanged = (keyword) => {
    this.groupingKeyword = keyword;
  };

  @action groupingDescriptionChanged = (description) => {
    this.groupingDescriptionCompleted = true;
    this.groupingDescription = description;
    this.groupingCreationDto.description = description;
  };

  @action groupingAddressSearchKeywordChanged = async (keyword) => {
    // koreanChecker does not working
    this.groupingAddressSearchKeyword = keyword;
    if (!this.koreanChecker.checkKoreanOrNot(keyword)) {
      return;
    }
    const result = await this.mapRepository.findAddressByKeyword(keyword);
    if (!result.isSucceed()) {
      return;
    }

    this.groupingAddressSearchResult = result.getAddressList();
  };

  @action groupingAddressSelected = (address) => {
    this.groupingAddressCompleted = true;
    this.groupingAddress = address;
    this.groupingCreationDto.pointDescription = address;
  };

  @action groupingGenderSelected = (gender) => {
    this.groupingGender = gender;
    this.groupingCreationDto.availableGender = gender;
    if (gender !== 'ALL') {
      this.genderChanged = true;
    }
    console.log(this.groupingGender);
  };

  @action groupingAvailableMinAgeChanged = (minAge) => {
    this.groupingAvailableMinAge = minAge;
    this.groupingCreationDto.minUserAge = minAge;
    console.log('change min age');
    console.log(this.groupingAvailableMinAge);
  };

  @action groupingAvailableMaxAgeChanged = (maxAge) => {
    this.groupingAvailableMaxAge = maxAge;
    this.groupingCreationDto.maxUserAge = maxAge;
    console.log('change max age');
    console.log(this.groupingAvailableMaxAge);
  };

  @action groupingBackgroundImageChanged = ({ uri }) => {
    if (Platform.OS === 'ios') {
      const askPermission = async () => {
        try {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          if (result === RESULTS.GRANTED) {
            this.groupingBackgroundImageURI = { uri };
            this.groupingCreationDto.representGroupImage = this.groupingBackgroundImageURI;
            console.log('background image changed IOS');
            console.log('IOS' + this.groupingBackgroundImageURI);
          }
        } catch (error) {
          console.log('askPermission', error);
        }
      };
      askPermission();
    }
    this.groupingBackgroundImageURI = { uri };
    this.groupingCreationDto.representGroupImage = this.groupingBackgroundImageURI;
    console.log('background image changed');
    console.log(this.groupingBackgroundImageURI);
  };

  @action isHeaderRightIconActivated = (groupingCreationView) => {
    if (
      this.groupingCreationViewStatus === groupingCreationView &&
      this.groupingCreationViewStatus === GROUPING_CREATION_VIEW_STATUS.NAME &&
      this.groupingTitle.length > MIN_TITLE_LENGTH
    ) {
      return true;
    }

    if (
      this.groupingCreationViewStatus === groupingCreationView &&
      this.groupingCreationViewStatus ===
        GROUPING_CREATION_VIEW_STATUS.INTERESTS &&
      this.keywordParser.parseKeyword(this.groupingKeyword)
    ) {
      return true;
    }

    if (
      this.groupingCreationViewStatus === groupingCreationView &&
      this.groupingCreationViewStatus ===
        GROUPING_CREATION_VIEW_STATUS.DESCRIPTION &&
      this.groupingDescription.length > MIN_DESCRIPTION_LENGTH
    ) {
      return true;
    }

    if (
      this.groupingCreationViewStatus === groupingCreationView &&
      this.groupingCreationViewStatus ===
        GROUPING_CREATION_VIEW_STATUS.EXTRA_INFO &&
      this.ageValidator.validateAge(
        Number(this.groupingAvailableMinAge),
        Number(this.groupingAvailableMaxAge),
      ) &&
      this.groupingGender !== '' &&
      this.groupingAddress !== ''
    ) {
      return true;
    }

    return false;
  };

  @action groupingCreationViewChanged(groupingCreationView) {
    this.groupingCreationViewStatus = groupingCreationView;
  }

  @action groupCreation = async () => {
    console.log('in');
    this.groupingCreationDto = await this.groupCreationRepository.completeGroupCreation(
      this.groupingCreationDto,
      (responseCode) => {
        console.log('responseCode : ');
        console.log(responseCode);
      },
    );
    console.log('out');

    console.log(this.groupingCreationDto);
    if (this.groupingCreationDto !== undefined) {
      console.log('group creation start');
      // 아래 코드 에러 확인하고 수정 에정
      this.groupingStore.groupCreationCompleted(this.groupingCreationDto);
      console.log('group creation completed');
    }
  };

  @computed get isPreviewButtonActivated() {
    console.log(this.groupingDescriptionCompleted);
    console.log(this.groupingAddressCompleted);
    return this.groupingDescriptionCompleted && this.groupingAddressCompleted;
  }

  @computed get getBackgroundImageURI() {
    return this.groupingBackgroundImageURI;
  }

  @computed get selectedGenderLimitMessage() {
    if (this.genderChanged === false) {
      return '성별 제한 추가';
    }
    if (this.groupingGender === 'MALE') {
      return '남자만 가입 가능';
    }
    if (this.groupingGender === 'FEMALE') {
      return '여자만 가입 가능';
    }
    return '모두환영';
  }

  @computed get genderFontColor() {
    return this.genderChanged !== false ? COLORS.BLACK : COLORS.FONT_GRAY;
  }

  @action initialize(groupingUserId) {
    this.groupingUserId = groupingUserId;
    this.groupingTitle = '';
    this.groupingKeyword = '';
    this.groupingDescription = '';
    this.groupingAddressSearchKeyword = '';
    this.groupingAddressSearchResult = [];
    this.groupingAddress = '';
    this.groupingGender = 'ALL';
    this.groupingPreviewNextButtonActivated = false;
    this.groupingDescriptionCompleted = false;
    this.groupingAddressCompleted = false;
    this.groupingCreationDto = new GroupingCreationDto();
    this.groupingCreationDto.representGroupingUserId = this.groupingUserId;
    this.groupingCreationDto.representGroupImage = this.groupingBackgroundImageURI;
    this.groupingCreationDto.isHidden = false;
    this.groupingCreationDto.pointX = 100;
    this.groupingCreationDto.pointY = 100;
    this.groupingCreationDto.hashtagList.push('키워드1');
    this.selectedGender = '';
  }
}
