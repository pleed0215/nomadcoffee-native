import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components/native";
import { ControlledInput } from "../../components/ControlledInput";
import { LoggedOutNavScreenParam } from "../../navigation/navs";
import { ButtonInactivable } from "../../components/ButtonInactivable";
import { useMutation } from "@apollo/client";
import { Login, LoginVariables } from "../../codegen/Login";
import { MUTATION_CREATE_ACCOUNT, MUTATION_LOGIN } from "../../apollo/queries";
import { Dimensions, Keyboard, Platform, TouchableOpacity } from "react-native";
import { makeLogin } from "../../apollo/client";
import {
  CreateAccount,
  CreateAccountVariables,
} from "../../codegen/CreateAccount";

import { DismissKeyboard } from "../../components/DismissKeyboard";
import { useEffect } from "react";

const windowHeight = Dimensions.get("window").height;

type FormProp = {
  email: string;
  username: string;
  password: string;
  password2: string;
};

const Container = styled.KeyboardAvoidingView`
  align-items: center;
  background-color: ${(props) => props.theme.background.primary};
  flex: 1;
  width: 100%;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  font-family: "LuckiestGuy";
  color: ${(props) => props.theme.color.primary};
  margin-top: ${windowHeight * 0.15}px;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-family: "LuckiestGuy";
  color: ${(props) => props.theme.color.primary};
  margin-top: ${windowHeight * 0.01}px;
  margin-bottom: 20px;
`;

const FormContainer = styled.ScrollView`
  width: 80%;
  flex: 0.9;
`;

const ButtonWrapper = styled.View`
  width: 100%;
  margin-top: 40px;
`;
const ErrorMsg = styled.Text`
  color: red;
  font-style: italic;
  font-size: 14px;
  margin-top: 10px;
`;
const Message = styled.Text`
  font-family: "DoHyeon";
  font-size: 20px;
  color: ${(props) => props.theme.color.primary};
  text-align: center;
`;
const LinkMessage = styled.Text`
  color: ${(props) => props.theme.color.link};
  font-size: 20px;
  font-family: "DoHyeon";
  text-align: center;
`;

export const AuthScreen: React.FC<LoggedOutNavScreenParam<"Auth">> = ({
  route,
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [login] = useMutation<Login, LoginVariables>(MUTATION_LOGIN, {
    onCompleted: (data) => {
      setLoading(false);

      if (data.login.ok && data.login.token) {
        makeLogin(data.login.token);
        navigation.replace("Home");
      } else {
        setError(`????????? ??????: ${data.login.error}`);
      }
    },
  });
  const [join] = useMutation<CreateAccount, CreateAccountVariables>(
    MUTATION_CREATE_ACCOUNT,
    {
      onCompleted: (data) => {
        setLoading(false);
        if (data.createAccount.ok) {
          alert("????????? ?????????????????????.");
          login({
            variables: {
              email: getValues("email"),
              password: getValues("password"),
            },
          });
        } else {
          setError(`?????? ?????? ??????: ${data.createAccount.error}`);
        }
      },
    }
  );
  const { control, getValues, formState, setFocus, handleSubmit, reset } =
    useForm<FormProp>({
      mode: "onBlur",
    });
  const { isCreating } = route.params;

  const onValid: SubmitHandler<FormProp> = (data) => {
    setLoading(true);
    const { email, password, username } = data;
    if (isCreating) {
      join({
        variables: {
          email,
          username,
          password,
        },
      });
    } else {
      login({
        variables: {
          email,
          password,
        },
      });
    }
  };
  const onNext = (inputName: keyof FormProp) => () => {
    switch (inputName) {
      case "email":
        setFocus(isCreating ? "username" : "password");
        break;
      case "username":
        setFocus("password");
        break;
      case "password":
        if (isCreating) {
          setFocus("password2");
        } else {
          Keyboard.dismiss();
        }
        break;
      default:
        Keyboard.dismiss();
        break;
    }
  };
  const onPressChangeAuth = () => {
    navigation.navigate("Auth", { isCreating: !isCreating });
  };

  useEffect(() => {
    reset({ username: "", email: "", password: "", password2: "" });
    setError(null);
  }, [isCreating]);

  return (
    <DismissKeyboard>
      <Container
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >
        <BigTitle>Nomad Coffee</BigTitle>
        <Title>{isCreating ? "Sign Up" : "Log In"}</Title>
        <FormContainer>
          <ControlledInput
            control={control}
            name="email"
            defaultValue=""
            placeholder="????????? ??????"
            keyboardType="email-address"
            returnKeyType="next"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={onNext("email")}
            rules={{
              required: { value: true, message: "???????????? ??????????????????." },
              pattern: {
                value: /\w+@\w+\.\w+/g,
                message: "????????? ????????? ????????? ??????????????????.",
              },
              minLength: { value: 4, message: "4?????? ?????? ????????????." },
              maxLength: { value: 30, message: "?????? ?????????. 30?????? ??????." },
            }}
          />
          {isCreating && (
            <ControlledInput
              control={control}
              name="username"
              defaultValue=""
              placeholder="????????????"
              autoCorrect={false}
              keyboardType="ascii-capable"
              returnKeyType="next"
              autoCapitalize="none"
              onSubmitEditing={onNext("username")}
              rules={{
                required: {
                  value: true,
                  message: "??????????????? ??????????????????.",
                },
                minLength: { value: 4, message: "4?????? ?????? ????????????." },
                maxLength: {
                  value: 16,
                  message: "?????? ?????????. 16?????? ??????.",
                },
              }}
            />
          )}
          <ControlledInput
            control={control}
            name="password"
            defaultValue=""
            placeholder="????????????"
            secureTextEntry
            autoCapitalize="none"
            keyboardType="ascii-capable"
            returnKeyLabel={isCreating ? undefined : "?????????"}
            returnKeyType={isCreating ? "next" : undefined}
            last={!isCreating}
            onSubmitEditing={onNext("password")}
            rules={{
              required: { value: true, message: "????????? ??????????????????." },
              minLength: { value: 8, message: "8?????? ?????? ????????????." },
              maxLength: { value: 20, message: "?????? ?????????. 20?????? ??????." },
            }}
          />
          {isCreating && (
            <ControlledInput
              control={control}
              name="password2"
              defaultValue=""
              placeholder="???????????? ??????"
              secureTextEntry
              autoCapitalize="none"
              keyboardType="ascii-capable"
              returnKeyLabel="??????"
              onSubmitEditing={onNext("password2")}
              last
              rules={{
                required: { value: true, message: "????????? ??????????????????." },
                validate: (password2) =>
                  password2 === getValues("password") ||
                  "??????????????? ???????????? ????????????.",
              }}
            />
          )}
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <ButtonWrapper>
            <ButtonInactivable
              fullWidth
              disabled={!formState.isValid}
              onPress={handleSubmit(onValid)}
              text={isCreating ? "Sign Up" : "Log in"}
              loading={loading}
            />
          </ButtonWrapper>

          <TouchableOpacity
            onPress={onPressChangeAuth}
            style={{ justifyContent: "center" }}
          >
            <LinkMessage>
              {isCreating ? "?????? ??????????????????, ?????????" : "??????????????????, ??????"}
            </LinkMessage>
          </TouchableOpacity>
        </FormContainer>
      </Container>
    </DismissKeyboard>
  );
};
